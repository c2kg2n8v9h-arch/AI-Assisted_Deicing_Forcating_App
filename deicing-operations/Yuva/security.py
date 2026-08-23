import json
import os
from collections.abc import Callable
from dataclasses import dataclass
from enum import Enum
from secrets import compare_digest
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer


class Role(str, Enum):
    VIEWER = "viewer"
    DISPATCHER = "dispatcher"
    ADMIN = "admin"


ROLE_PERMISSIONS = {
    Role.VIEWER: frozenset({"operations:read"}),
    Role.DISPATCHER: frozenset({"operations:read", "recommendations:decide"}),
    Role.ADMIN: frozenset({"operations:read", "recommendations:decide", "users:manage"}),
}


@dataclass(frozen=True)
class User:
    username: str
    role: Role
    permissions: frozenset[str]
    station_codes: frozenset[str] = frozenset({"*"})


bearer_scheme = HTTPBearer(auto_error=False)


def _configured_users() -> list[dict[str, Any]]:
    raw_users = os.getenv("DEICING_USERS", "")
    if not raw_users:
        return []

    try:
        users = json.loads(raw_users)
    except json.JSONDecodeError as error:
        raise RuntimeError("DEICING_USERS must contain valid JSON") from error

    if not isinstance(users, list):
        raise RuntimeError("DEICING_USERS must be a JSON list")
    return users


def auth_enabled() -> bool:
    return bool(os.getenv("DEICING_USERS", ""))


def local_mode_enabled() -> bool:
    return (
        os.getenv("DEICING_LOCAL_MODE", "").lower() == "true"
        and os.getenv("DEICING_ENV", "development").lower() != "production"
    )


def _find_user(api_key: str) -> User | None:
    for configured_user in _configured_users():
        configured_key = str(configured_user.get("api_key", ""))
        if not compare_digest(api_key, configured_key):
            continue
        try:
            role = Role(configured_user["role"])
        except (KeyError, ValueError) as error:
            raise RuntimeError("Each configured user must have a valid role") from error
        station_codes = configured_user.get("station_codes")
        if not isinstance(station_codes, list) or not station_codes:
            raise RuntimeError("Each configured user must have a non-empty station_codes list")
        return User(
            username=str(configured_user.get("username", "unknown")),
            role=role,
            permissions=ROLE_PERMISSIONS[role],
            station_codes=frozenset(str(code).upper() for code in station_codes),
        )
    return None


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> User:
    if not auth_enabled():
        if local_mode_enabled():
            return User("local-development", Role.VIEWER, ROLE_PERMISSIONS[Role.VIEWER])
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication is not configured",
        )

    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer authentication is required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = _find_user(credentials.credentials)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def require_roles(*allowed_roles: Role) -> Callable:
    def role_dependency(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This user role does not have permission for this operation",
            )
        return user

    return role_dependency


def authorize_station(user: User, station_code: str) -> None:
    """Enforce station scope independently of the client interface."""
    station_code = station_code.upper()
    if "*" not in user.station_codes and station_code not in user.station_codes:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This user is not authorized for the requested station",
        )
