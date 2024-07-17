## Database Schema

1. Users Table

```sql
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    date_joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active'
);
```

2. Events Table

```sql
CREATE TABLE Events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    date TIMESTAMP NOT NULL,
    owner_user_id INTEGER NOT NULL REFERENCES Users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

3. Participants Table

```sql
CREATE TABLE Participants (
    event_id INTEGER NOT NULL REFERENCES Events(id),
    user_id INTEGER NOT NULL REFERENCES Users(id),
    PRIMARY KEY (event_id, user_id)
);
```

4. EventsPayments Table

```sql
CREATE TABLE EventPayments (
    event_id INTEGER NOT NULL REFERENCES Events(id),
    user_id INTEGER NOT NULL REFERENCES Users(id),
    spent NUMERIC(10, 2) NOT NULL,
    paid NUMERIC(10, 2) NOT NULL,
    PRIMARY KEY (event_id, user_id)
);
```

5. Expenses Table

```sql
CREATE TABLE Expenses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(id),
    other_user_id INTEGER NOT NULL REFERENCES Users(id),
    event_id INTEGER REFERENCES Events(id),
    reason TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    is_cleared BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
