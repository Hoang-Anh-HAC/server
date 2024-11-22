const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const productRoute = require("./api/routes/productRoute");
const brandRoute = require("./api/routes/brandRoute");
const categoryRoute = require("./api/routes/categoryRoute");
const prodformRoute = require("./api/routes/prodformRoute");
const formadRoute = require("./api/routes/formadRoute");
const filterRoute = require("./api/routes/filterRoute");
const authRoute = require("./api/routes/authRoute");
const seriesRoute = require("./api/routes/seriesRoute");
const optionRoute = require("./api/routes/optionRoute");

const mongoConnect = require("./api/configs/mongoConnect");
const { notFound, errorHandler } = require("./api/middlewares/errorHandle");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT;

const adminURL = "YF3cEfjECuVa1CbgRijdo2YvGEz5cn4onq46JtUWO2A";

mongoConnect();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

app.use(morgan("dev"));

app.use("/api/product", productRoute);
app.use("/api/series", seriesRoute);
app.use("/api/brand", brandRoute);
app.use("/api/category", categoryRoute);
app.use("/api/prodform", prodformRoute);
app.use("/api/formad", formadRoute);
app.use("/api/filter", filterRoute);
app.use("/api/option", optionRoute);
app.use(`/api/${adminURL}`, authRoute);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
});
