# Database Schema

## cars
| Column | Type | Notes |
|--------|------|-------|
| id | INT | primary key, auto increment |
| make | VARCHAR | e.g. Chevy, Ford |
| model | VARCHAR | e.g. Equinox, Escape |
| year | INT | |
| vin | VARCHAR | |
| mileage | INT | |
| drivetrain | VARCHAR | AWD or FWD |
| title_status | VARCHAR | salvage, rebuilt, clear |
| damage_type | VARCHAR | front, side, rear, mechanical |
| kbb_trade_in | DECIMAL | |
| kbb_private | DECIMAL | |
| iaa_acv | DECIMAL | IAA's own estimate |
| repair_estimate | DECIMAL | |
| contingency | DECIMAL | buffer for surprises |
| labor_hours | DECIMAL | |
| labor_rate | DECIMAL | $ per hour |
| iaa_fees | DECIMAL | |
| tax_reg_insurance | DECIMAL | |
| actual_bid | DECIMAL | |
| iaa_cost | DECIMAL | total paid including fees |
| status | VARCHAR | evaluating, active, sold, passed |
| sold_price | DECIMAL | |
| sold_date | DATE | |
| sold_platform | VARCHAR | e.g. Facebook Marketplace |

## parts
| Column | Type | Notes |
|--------|------|-------|
| id | INT | primary key, auto increment |
| car_id | INT | foreign key → cars.id |
| part_name | VARCHAR | |
| vendor | VARCHAR | e.g. eBay, AutoZone |
| cost | DECIMAL | |
