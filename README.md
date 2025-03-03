# TODO API

This is a simple TODO API built with Node.js, Effect, and MongoDB. It provides endpoints for user authentication and managing TODO items.

## 🚀 Setup Instructions

1.  **Clone the Repository**

    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```

2.  **Install Dependencies**

    ```bash
    npm install
    ```

3.  **Set Up Environment Variables**

    Create a `.env` file in the root directory and add the following:

    ```
    PORT=3000
    MONGODB_URI=mongodb://localhost:27017/todoapp
    JWT_SECRET=ultrasecret
    ```

    * `PORT`: The port on which the server will run.
    * `MONGODB_URI`: The MongoDB connection URI. Ensure MongoDB is running locally or provide a remote connection string.
    * `JWT_SECRET`: A secret key used for JWT token generation. **Important:** Replace `ultrasecret` with a strong, unique secret in a production environment.

4.  **Start the Server**

    ```bash
    npm start
    ```

## 🛠 API Endpoints

### 🔹 1. Register a New User

* **Method:** `POST`
* **URL:** `http://localhost:3000/users`
* **Body (JSON):**

    ```json
    {
      "email": "testuser@example.com",
      "password": "securepassword"
    }
    ```

* **Expected Response:**

    ```
    "User registered successfully"
    ```

### 🔹 2. Login to Get JWT Token

* **Method:** `POST`
* **URL:** `http://localhost:3000/users/login`
* **Body (JSON):**

    ```json
    {
      "email": "testuser@example.com",
      "password": "securepassword"
    }
    ```

* **Expected Response:**

    ```
    "your-jwt-token-here"
    ```

    👉 Copy this token for subsequent requests that require authentication.

### 🔹 3. Create a New TODO (Requires Token)

* **Method:** `POST`
* **URL:** `http://localhost:3000/todos`
* **Headers:**
    * `Authorization: Bearer your-jwt-token-here`
    * `Content-Type: application/json`
* **Body (JSON):**

    ```json
    {
      "text": "Buy groceries"
    }
    ```

* **Expected Response:**

    ```json
    {
      "text": "Buy groceries",
      "completed": false
    }
    ```

### 🔹 4. Get All TODOs (Requires Token)

* **Method:** `GET`
* **URL:** `http://localhost:3000/todos`
* **Headers:**
    * `Authorization: Bearer your-jwt-token-here`
* **Expected Response:**

    ```json
    [
      {
        "text": "Buy groceries",
        "completed": false
      }
    ]
    ```

### 🔹 5. Update a TODO (Requires Token)

* **Method:** `PATCH`
* **URL:** `http://localhost:3000/todos/{todo-id}` (Replace `{todo-id}` with the actual TODO ID)
* **Headers:**
    * `Authorization: Bearer your-jwt-token-here`
    * `Content-Type: application/json`
* **Body (JSON):**

    ```json
    {
      "completed": true
    }
    ```

* **Expected Response:**

    ```
    "Todo updated successfully"
    ```

### 🔹 6. Delete a TODO (Requires Token)

* **Method:** `DELETE`
* **URL:** `http://localhost:3000/todos/{todo-id}` (Replace `{todo-id}` with the actual TODO ID)
* **Headers:**
    * `Authorization: Bearer your-jwt-token-here`
* **Expected Response:**

    ```
    "Todo deleted"
    ```

## 🎯 Notes

* Ensure MongoDB is running locally or provide a remote MongoDB connection in the `.env` file.
* Every request that modifies or retrieves TODOs requires JWT authentication.
* Remember to replace `<repository_url>` and `<repository_directory>` with your actual repository URL and local directory name.
* Always protect your `JWT_SECRET` in a production environment. Do not commit it to version control.
* For production, consider using a process manager like PM2 to keep the server running.
