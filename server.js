const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();

const bucketPath = (bucket) => `./App/buckets/${bucket}.json`;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const HistoryData = JSON.parse(
    fs.readFileSync("./history.json").toString() || "[]"
);

app.get("/", (_, res) => {
    res.send("Hello");
});

app.get("/buckets", (_, res) => {
    res.send(
        fs
            .readdirSync("./App/buckets")
            .map((bucket) => ({ name: bucket.replace(".json", "") }))
    );
});

app.post("/buckets", (req, res) => {
    const bucket = req.body.data;

    fs.writeFileSync(bucketPath(bucket), "[]");

    res.send("Done");
});

app.delete("/buckets", (req, res) => {
    const bucket = req.body.data;

    if (bucket && fs.existsSync(bucketPath(bucket))) {
        fs.rmSync(bucketPath(bucket));
        res.send("Done");
    } else {
        res.send("No bucket found");
    }
});

app.get("/cards", (req, res) => {
    const bucket = req.query.bucket;

    if (bucket && fs.existsSync(bucketPath(bucket))) {
        res.send(fs.readFileSync(bucketPath(bucket)).toString());
    } else {
        res.send("No bucket found, Create bucket first");
    }
});

app.post("/cards", (req, res) => {
    const bucket = req.body.bucket,
        data = req.body.data;

    if (bucket && fs.existsSync(bucketPath(bucket))) {
        const storedData = JSON.parse(
            fs.readFileSync(bucketPath(bucket)).toString()
        );

        storedData.push(data);

        fs.writeFileSync(bucketPath(bucket), JSON.stringify(storedData));
        res.send("Done");
    } else {
        res.send("No bucket found, Create bucket first");
    }
});

app.patch("/cards", (req, res) => {
    const bucket = req.body.bucket,
        data = req.body.data;

    if (bucket && fs.existsSync(bucketPath(bucket))) {
        const storedData = JSON.parse(
            fs.readFileSync(bucketPath(bucket)).toString()
        );

        fs.writeFileSync(
            bucketPath(bucket),
            JSON.stringify(
                storedData.map((card) => {
                    if (card.id === data.id) return data;
                    return card;
                })
            )
        );
        res.send("Done");
    } else {
        res.send("No bucket found, Create bucket first");
    }
});

app.delete("/cards", (req, res) => {
    const bucket = req.body.bucket,
        data = req.body.data;

    if (bucket && fs.existsSync(bucketPath(bucket))) {
        const storedData = JSON.parse(
            fs.readFileSync(bucketPath(bucket)).toString()
        );

        fs.writeFileSync(
            bucketPath(bucket),
            JSON.stringify(storedData.filter((card) => !data[card.id]))
        );
        res.send("Done");
    } else {
        res.send("No bucket found, Create bucket first");
    }
});

app.get("/history", (_, res) => {
    res.send(HistoryData);
});

app.post("/history", (req, res) => {
    const data = req.body.data;

    HistoryData.push(data);
    fs.writeFileSync("./history.json", JSON.stringify(HistoryData));

    res.send("Done");
});

app.get("*", (_, res) => {
    res.send("Bye");
});

app.listen(process.env.PORT || 8080, () =>
    console.log("server started on Port:8080")
);
