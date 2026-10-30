import 'dotenv/config'
import app from "./app.js";
import connectDB from "./configs/db.js";

connectDB()
const port = process.env.PORT
app.listen(port, () => {
    console.log(`server http://localhost:${port} is running 🔥!`)
})
