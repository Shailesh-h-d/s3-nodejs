const express = require('express');
require("dotenv").config();
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const app = express();

app.listen(3000, () => {
    console.log("server is listening on port 3000");
});

aws.config.update({
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    accessKeyId: process.env.ACCESS_KEY,
    region: process.env.REGION,
});

const S3 = new aws.S3();

const upload = multer({
    storage: multerS3({
        bucket: process.env.BUCKET,
        s3: S3,
        acl: "public-read", 
        key: (req, file, cb) => {
            cb(null, file.originalname)
        }
    }),
})

app.put('/upload', upload.single("file"), (req, res) => {
    // upload.single("file") 
    console.log(req.file);
    return res.status(200).send({
        statusCode: 200,
        message: `successfully uploaded ${req.file.location}`
    });
})

app.get('/list', async(req, res) => {
    let list = await S3.listObjectsV2({Bucket: process.env.BUCKET}).promise();
    let listMapped = list.Contents.map((item) => {
        return item.Key;
    })
    return res.status(200).send({
        statusCode: 200,
        list: listMapped
    })
})

app.get('/download/:fileName', async(req, res) => {
    const fileName = req.params.fileName
    let file = await S3.getObject({
        Bucket: process.env.BUCKET,
        Key: fileName
    }).promise();
    // return res.status(200).send({
    //     statusCode: 200,
    //     file: file.Body
    // })
    res.send(file.Body);
})

app.delete('/delete/:fileName', async(req, res) => {
    const fileName = req.params.fileName;
    await S3.deleteObject({
        Bucket: process.env.BUCKET,
        Key: fileName
    }).promise();
    res.send(`${fileName} has been deleted successfully`);
})