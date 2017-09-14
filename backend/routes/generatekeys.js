'use strict';
const express = require('express');
const router = express.Router();

const Promise = require('bluebird');
const crypto = require('mz/crypto');

const assertValidAdminPassword = require('../status.js').assertValidAdminPassword;
const compareAdminPassword = require('../status.js').compareAdminPassword;
const setStudentKeys = require('../database.js').setStudentKeys;

router.post('/', (req, res) => {
    const adminPassword = req.body.adminPassword;
    const firstGraders = req.body.firstGraders;
    const secondGraders = req.body.secondGraders;
    try {
        assertValidAdminPassword(adminPassword);
    } catch (e) {
        res.status(401).send(e);
        return;
    }

    compareAdminPassword(adminPassword).then(compareResult => {
        if (!compareResult) {
            res.status(401).send('The administrator password is not correct!');
            return;
        }

        const firstGradeKeys = new Set();
        const secondGradeKeys = new Set();
        let promise = Promise.resolve();
        for (let i = 0; i < firstGraders; i++) {
            promise = promise.then(() => {
                return generateNewRandomKey(firstGradeKeys, secondGradeKeys);
            }).then((result) => {
                firstGradeKeys.add(result);
            });
        }
        for (let i = 0; i < secondGraders; i++) {
            promise = promise.then(() => {
                return generateNewRandomKey(firstGradeKeys, secondGradeKeys);
            }).then((result) => {
                secondGradeKeys.add(result);
            });
        }
        return promise.then(() => {
            return {
                firstGradeKeys: firstGradeKeys,
                secondGradeKeys: secondGradeKeys
            };
        });
    }).then(setStudentKeys).then(keys => {
        res.status(200).send({
            firstGradeKeys: Array.from(keys.firstGradeKeys.values()),
            secondGradeKeys: Array.from(keys.secondGradeKeys.values())
        });
    }).catch(e => {
        console.error(e.stack);
        res.status(500).send(e);
    });
});

function generateNewRandomKey(existingFirstGradeKeys, existingSecondGradeKeys) {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(3).then(buf => {
            const randomInteger = parseInt(buf.toString('hex'), 16);
            if (randomInteger > 9999999 || existingFirstGradeKeys.has(randomInteger) || existingSecondGradeKeys.has(randomInteger)) {
                resolve(generateNewRandomKey(existingFirstGradeKeys, existingSecondGradeKeys));
            } else {
                resolve(randomInteger);
            }
        });
    });
}

module.exports = router;
