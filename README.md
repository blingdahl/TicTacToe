# MySQL and Server Setup Instructions

## 1. Install MySQL

### On macOS (using Homebrew)
```sh
brew update
brew install mysql
```

### On Ubuntu/Debian
```sh
sudo apt update
sudo apt install mysql-server
```

### On Windows
- Download the MySQL Installer from: https://dev.mysql.com/downloads/installer/
- Run the installer and follow the prompts.

---

## 2. Start the MySQL Server

### macOS (Homebrew)
```sh
brew services start mysql
```

### Ubuntu/Debian
```sh
sudo service mysql start
```

### Windows
- MySQL should start automatically after installation. If not, start it from the Services app (`services.msc`).

---

## 3. Secure MySQL (Optional but Recommended)
```sh
mysql_secure_installation
```
Follow the prompts to set a root password and secure your installation.

---

## 4. Create a Database and User

```sh
mysql -u root -p
```
Then, in the MySQL prompt:
```sql
CREATE DATABASE tictactoe;
CREATE USER 'tictactoe_user'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON tictactoe.* TO 'tictactoe_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 5. Initialize MySQL with the Schema

Assuming your schema is in `db/schema.sql`:
```sh
mysql -u tictactoe_user -p tictactoe < db/schema.sql
```

---

## 6. Configure Your App

Update your `.env` or config file with:
```
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=tictactoe_user
MYSQL_PASSWORD=yourpassword
MYSQL_DATABASE=tictactoe
```

---

## 7. Start Your Node.js Server

```sh
cd server
npm run dev
```
**or**
```sh
npm start
```

---

You should now have MySQL running, your schema loaded, and your server ready to connect!

## Running Tests

### jest tests

```
cd server
npm test
```

### Integration tests

```
cd scripts
test.sh
```