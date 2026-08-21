# Operations Data Format

The sample file is [operations_data.json](../data/operations_data.json).

Supported station profiles are stored in [stations.json](../data/stations.json). Each profile contains a station code, airport name, timezone, runway and deicing-pad counts, crew count, and station-specific weather.

## Weather

- `temperature_c`: Air temperature in Celsius.
- `precipitation_type`: For example, `snow`, `freezing_rain`, or `none`.
- `snow_rate_cm_hr`: Snowfall rate in centimeters per hour.
- `wind_speed_kts`: Wind speed in knots.

## Flights

- `flight_id`: Unique flight identifier.
- `aircraft_type`: Aircraft model, such as `A320` or `B777`.
- `scheduled_departure`: Departure timestamp in ISO 8601 format.
- `gate`: Airport gate identifier.
- `passengers_count`: Number of passengers affected.

## Trucks

- `truck_id`: Unique deicing truck identifier.
- `location_gate`: Current truck location.
- `fluid_capacity_pct`: Remaining fluid capacity as a percentage.
- `is_available`: Whether the truck can be assigned.
