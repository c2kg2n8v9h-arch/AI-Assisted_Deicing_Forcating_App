import os
import unittest
from unittest.mock import patch

from fastapi import HTTPException

from Yuva.security import (
    ROLE_PERMISSIONS,
    Role,
    User,
    _find_user,
    auth_enabled,
    get_current_user,
    require_roles,
)


class SecurityTests(unittest.TestCase):
    def test_local_development_uses_admin_user_when_auth_is_unconfigured(self):
        with patch.dict(os.environ, {}, clear=True):
            user = get_current_user(None)

        self.assertEqual(user.username, "local-development")
        self.assertEqual(user.role, Role.ADMIN)

    def test_configured_api_key_resolves_to_role(self):
        users = '[{"username":"dispatcher1","role":"dispatcher","api_key":"secret-key"}]'
        with patch.dict(os.environ, {"DEICING_USERS": users}):
            user = _find_user("secret-key")
            enabled = auth_enabled()

        self.assertTrue(enabled)
        self.assertIsNotNone(user)
        self.assertEqual(user.role, Role.DISPATCHER)
        self.assertIn("operations:dispatch", user.permissions)

    def test_viewer_is_rejected_from_dispatch_permission(self):
        viewer = User("viewer1", Role.VIEWER, ROLE_PERMISSIONS[Role.VIEWER])
        dependency = require_roles(Role.DISPATCHER, Role.ADMIN)

        with self.assertRaises(HTTPException) as error:
            dependency(viewer)

        self.assertEqual(error.exception.status_code, 403)


if __name__ == "__main__":
    unittest.main()
