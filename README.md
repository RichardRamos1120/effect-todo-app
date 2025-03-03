TODO API

🚀 Setup Instructions

1️⃣ Clone the Repository

git clone <your-repository-url>
cd <your-repository-folder>

2️⃣ Install Dependencies

npm install

3️⃣ Set Up Environment Variables

Create a .env file in the root directory and add the following:

PORT=3000
MONGODB_URI=mongodb://localhost:27017/todoapp
JWT_SECRET=ultrasecret

4️⃣ Start the Server

npm start

🛠 API Endpoints

🔹 1. Register a New User

Method: POSTURL: http://localhost:3000/usersBody (JSON):

{
  "email": "testuser@example.com",
  "password": "securepassword"
}

Expected Response:

"User registered successfully"

🔹 2. Login to Get JWT Token

Method: POSTURL: http://localhost:3000/users/loginBody (JSON):

{
  "email": "testuser@example.com",
  "password": "securepassword"
}

Expected Response:

"your-jwt-token-here"

👉 Copy this token for the next requests.

🔹 3. Create a New TODO (Requires Token)

Method: POSTURL: http://localhost:3000/todosHeaders:

Authorization: Bearer your-jwt-token-here
Content-Type: application/json

Body (JSON):

{
  "text": "Buy groceries"
}

Expected Response:

{
  "text": "Buy groceries",
  "completed": false
}

🔹 4. Get All TODOs (Requires Token)

Method: GETURL: http://localhost:3000/todosHeaders:

Authorization: Bearer your-jwt-token-here

Expected Response:

[
  {
    "text": "Buy groceries",
    "completed": false
  }
]

🔹 5. Update a TODO (Requires Token)

Method: PATCHURL: http://localhost:3000/todos/{todo-id}Headers:

Authorization: Bearer your-jwt-token-here
Content-Type: application/json

Body (JSON):

{
  "completed": true
}

Expected Response:

"Todo updated successfully"

🔹 6. Delete a TODO (Requires Token)

Method: DELETEURL: http://localhost:3000/todos/{todo-id}Headers:

Authorization: Bearer your-jwt-token-here

Expected Response:

"Todo deleted"

🎯 Notes

Make sure MongoDB is running locally or provide a remote MongoDB connection in the .env file.

Every request that modifies or retrieves todos requires JWT authentication.
