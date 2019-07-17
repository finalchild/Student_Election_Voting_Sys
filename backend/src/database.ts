import * as bcrypt from 'bcrypt';
import {Database} from 'sqlite3';
import Status from './common/Status';
import Candidates from './common/Candidates';
import Candidate from './common/Candidate';
import KeyStatus from './common/KeyStatus';
import Keys from './common/Keys';
import CandidateNames from './common/CandidateNames';
import Student from './common/Student';
import {assertValidAdminPassword, assertValidKey} from './common/util';
import StudentInfoes from './common/StudentInfoes';

export const db = new Database('database.sqlite3', err => {
    if (err) {
        console.error(err.message);
    }
});

export const saltRounds = 10;

export async function getStudent(key: number): Promise<Student> {
    assertValidKey(key);
    return await new Promise<Student>((resolve, reject) => {
        db.serialize(() => {
            db.get('SELECT unique_key AS key, voted, grade, name, student_number AS studentNumber FROM student WHERE Key = ?', [key], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row);
            });
        });
    });
}

export async function getStudents(): Promise<Array<Student>> {
    return await new Promise<Array<Student>>((resolve, reject) => {
        db.serialize(() => {
            db.all('SELECT unique_key AS key, voted, grade, name, student_number AS studentNumber FROM student', [], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    });
}

export async function tryToSetVoted(key: number): Promise<void> {
    assertValidKey(key);
    await new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('UPDATE student SET voted = 1 WHERE unique_key = ? AND voted = 0', [key], function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                if (this.changes === 0) {
                    reject('Couldn\'t set voted. Maybe you have already voted?');
                    return;
                }
                resolve();
            });
        });
    });
}

/**
 * 투표
 * @param key 투표자 키
 * @param grade 투표자 학년
 * @param candidateName1M 1학년 남자 후보자 이름 (falsy인 경우 무시)
 * @param candidateName1F 1학년 여자 후보자 이름 (falsy인 경우 무시)
 * @param candidateName2 2학년 후보자 이름 (falsy인 경우 무시)
 */
export async function vote(key: number, grade: number, candidateName1M: string, candidateName1F: string, candidateName2: string): Promise<void> {
    await new Promise((resolve, reject) => {
        let gradeVotesColumn = '';
        if (grade === 1) gradeVotesColumn = 'first_grade_votes';
        else if (grade === 2) gradeVotesColumn = 'second_grade_votes';
        else if (grade === 3) gradeVotesColumn = 'third_grade_votes';
        else throw 'Invalid grade!';
        assertValidKey(key);
        tryToSetVoted(key)
            .then(() => {
                db.serialize(() => {
                    db.run('BEGIN TRANSACTION');
                    if (candidateName1M) {
                        db.run(`UPDATE candidate1M
                        SET votes = votes + 1, ${gradeVotesColumn} = ${gradeVotesColumn} + 1
                        WHERE name = ?`, [candidateName1M]);
                    }
                    if (candidateName1F) {
                        db.run(`UPDATE candidate1F
                        SET votes = votes + 1, ${gradeVotesColumn} = ${gradeVotesColumn} + 1
                        WHERE name = ?`, [candidateName1F]);
                    }
                    if (candidateName2) {
                        db.run(`UPDATE candidate2
                        SET votes = votes + 1, ${gradeVotesColumn} = ${gradeVotesColumn} + 1
                        WHERE name = ?`, [candidateName2]);
                    }
                    db.run('COMMIT', [], (err) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve();
                    });
                });
            });
    });
}

export function getCandidate1M(candidateName: string) {
    return new Promise((resolve, reject) => {
        if (candidateName) {
            db.serialize(() => {
                db.get('SELECT name, votes, first_grade_votes as firstGradeVotes, second_grade_votes as secondGradeVotes, third_grade_votes as thirdGradeVotes FROM candidate1M WHERE name = ?', [candidateName], (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(row);
                });
            });
        } else {
            // candidateName이 falsy면 truthy 값을 반환.
            resolve('truthy');
        }
    });
}

export function getCandidate1F(candidateName: string) {
    return new Promise((resolve, reject) => {
        if (candidateName) {
            db.serialize(() => {
                db.get('SELECT name, votes, first_grade_votes as firstGradeVotes, second_grade_votes as secondGradeVotes, third_grade_votes as thirdGradeVotes FROM candidate1F WHERE name = ?', [candidateName], (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(row);
                });
            });
        } else {
            // candidateName이 falsy면 truthy 값을 반환.
            resolve('truthy');
        }
    });
}

export function getCandidate2(candidateName: string) {
    return new Promise((resolve, reject) => {
        if (candidateName) {
            db.serialize(() => {
                db.get('SELECT name, votes, first_grade_votes as firstGradeVotes, second_grade_votes as secondGradeVotes, third_grade_votes as thirdGradeVotes FROM candidate2 WHERE name = ?', [candidateName], (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(row);
                });
            });
        } else {
            // candidateName이 falsy면 truthy 값을 반환.
            resolve('truthy');
        }
    });
}

export async function getCandidates1M(): Promise<Array<Candidate>> {
    return await new Promise<Array<Candidate>>((resolve, reject) => {
        db.serialize(() => {
            db.all('SELECT name, votes, first_grade_votes as firstGradeVotes, second_grade_votes as secondGradeVotes, third_grade_votes as thirdGradeVotes FROM candidate1M', [], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    });
}

export async function getCandidates1F(): Promise<Array<Candidate>> {
    return await new Promise<Array<Candidate>>((resolve, reject) => {
        db.serialize(() => {
            db.all('SELECT name, votes, first_grade_votes as firstGradeVotes, second_grade_votes as secondGradeVotes, third_grade_votes as thirdGradeVotes FROM candidate1F', [], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    });
}

export async function getCandidates2(): Promise<Array<Candidate>> {
    return await new Promise<Array<Candidate>>((resolve, reject) => {
        db.serialize(() => {
            db.all('SELECT name, votes, first_grade_votes as firstGradeVotes, second_grade_votes as secondGradeVotes, third_grade_votes as thirdGradeVotes FROM candidate2', [], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    });
}

export async function getCandidates(): Promise<Candidates> {
    const promiseCandidates1M = getCandidates1M();
    const promiseCandidates1F = getCandidates1F();
    const promiseCandidates2 = getCandidates2();

    return {
        candidates1M: await promiseCandidates1M,
        candidates1F: await promiseCandidates1F,
        candidates2: await promiseCandidates2
    }
}

export async function setCandidates(candidates: Candidates): Promise<Candidates> {
    const statement1M = 'INSERT INTO candidate1M (name, votes, first_grade_votes, second_grade_votes, third_grade_votes) VALUES ' + new Array(candidates.candidates1M.length).fill('(?, ?, ?, ?, ?)').join(', ');
    const placeholder1M = [];
    candidates.candidates1M.forEach(candidate => {
        placeholder1M.push(candidate.name);
        placeholder1M.push(candidate.votes);
        placeholder1M.push(candidate.firstGradeVotes);
        placeholder1M.push(candidate.secondGradeVotes);
        placeholder1M.push(candidate.thirdGradeVotes);

    });
    const statement1F = 'INSERT INTO candidate1F (name, votes, first_grade_votes, second_grade_votes, third_grade_votes) VALUES ' + new Array(candidates.candidates1F.length).fill('(?, ?, ?, ?, ?)').join(', ');
    const placeholder1F = [];
    candidates.candidates1F.forEach(candidate => {
        placeholder1F.push(candidate.name);
        placeholder1F.push(candidate.votes);
        placeholder1F.push(candidate.firstGradeVotes);
        placeholder1F.push(candidate.secondGradeVotes);
        placeholder1F.push(candidate.thirdGradeVotes);
    });
    const statement2 = 'INSERT INTO candidate2 (name, votes, first_grade_votes, second_grade_votes, third_grade_votes) VALUES ' + new Array(candidates.candidates2.length).fill('(?, ?, ?, ?, ?)').join(', ');
    const placeholder2 = [];
    candidates.candidates2.forEach(candidate => {
        placeholder2.push(candidate.name);
        placeholder2.push(candidate.votes);
        placeholder2.push(candidate.firstGradeVotes);
        placeholder2.push(candidate.secondGradeVotes);
        placeholder2.push(candidate.thirdGradeVotes);
    });

    await new Promise<Candidates>((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            db.run('DELETE FROM candidate1M');
            db.run('DELETE FROM candidate1F');
            db.run('DELETE FROM candidate2');
            if (placeholder1M.length !== 0) {
                db.run(statement1M, placeholder1M);
            }
            if (placeholder1F.length !== 0) {
                db.run(statement1F, placeholder1F);
            }
            if (placeholder2.length !== 0) {
                db.run(statement2, placeholder2);
            }
            db.run('COMMIT', [], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    });
    return candidates;
}

export async function getCandidateNames(): Promise<CandidateNames> {
    const candidates = await getCandidates();
    return {
        pollName: await getPollName(),
        candidateNames1M: candidates.candidates1M.map(candidate => candidate.name),
        candidateNames1F: candidates.candidates1F.map(candidate => candidate.name),
        candidateNames2: candidates.candidates2.map(candidate => candidate.name)
    };
}

export async function setCandidateNames(candidateNames: CandidateNames): Promise<void> {
    await setPollName(candidateNames.pollName);
    const statement1M = 'INSERT INTO candidate1M (name, votes, first_grade_votes, second_grade_votes, third_grade_votes) VALUES ' + new Array(candidateNames.candidateNames1M.length).fill('(?, ?, ?, ?, ?)').join(', ');
    const placeholder1M = [];
    candidateNames.candidateNames1M.forEach(candidateName => {
        placeholder1M.push(candidateName);
        placeholder1M.push(0);
        placeholder1M.push(0);
        placeholder1M.push(0);
        placeholder1M.push(0);
    });
    const statement1F = 'INSERT INTO candidate1F (name, votes, first_grade_votes, second_grade_votes, third_grade_votes) VALUES ' + new Array(candidateNames.candidateNames1F.length).fill('(?, ?, ?, ?, ?)').join(', ');
    const placeholder1F = [];
    candidateNames.candidateNames1F.forEach(candidateName => {
        placeholder1F.push(candidateName);
        placeholder1F.push(0);
        placeholder1F.push(0);
        placeholder1F.push(0);
        placeholder1F.push(0);
    });
    const statement2 = 'INSERT INTO candidate2 (name, votes, first_grade_votes, second_grade_votes, third_grade_votes) VALUES ' + new Array(candidateNames.candidateNames2.length).fill('(?, ?, ?, ?, ?)').join(', ');
    const placeholder2 = [];
    candidateNames.candidateNames2.forEach(candidateName => {
        placeholder2.push(candidateName);
        placeholder2.push(0);
        placeholder2.push(0);
        placeholder2.push(0);
        placeholder2.push(0);
    });
    await new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            db.run('DELETE FROM candidate1M');
            db.run('DELETE FROM candidate1F');
            db.run('DELETE FROM candidate2');
            if (placeholder1M.length !== 0) {
                db.run(statement1M, placeholder1M);
            }
            if (placeholder1F.length !== 0) {
                db.run(statement1F, placeholder1F);
            }
            if (placeholder2.length !== 0) {
                db.run(statement2, placeholder2);
            }
            db.run('COMMIT', [], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    });
}

// SQL Injection 체크를 하지 않습니다. 절대로 입력받은 것을 인자로 넣지 마세요.
export async function setStudentKeys(keys: Keys, studentInfoes: StudentInfoes): Promise<void> {
    const firstGradeStudents = [];
    for (let i = 0; i < studentInfoes.firstGradeStudentInfoes.length; i++) {
        firstGradeStudents.push(`(${keys.firstGradeKeys[i]}, 0, 1, '${studentInfoes.firstGradeStudentInfoes[i].name}', ${studentInfoes.firstGradeStudentInfoes[i].studentNumber})`);
    }
    const secondGradeStudents = [];
    for (let i = 0; i < studentInfoes.secondGradeStudentInfoes.length; i++) {
        secondGradeStudents.push(`(${keys.secondGradeKeys[i]}, 0, 2, '${studentInfoes.secondGradeStudentInfoes[i].name}', ${studentInfoes.secondGradeStudentInfoes[i].studentNumber})`);
    }
    const thirdGradeStudents = [];
    for (let i = 0; i < studentInfoes.thirdGradeStudentInfoes.length; i++) {
        thirdGradeStudents.push(`(${keys.thirdGradeKeys[i]}, 0, 3, '${studentInfoes.thirdGradeStudentInfoes[i].name}', ${studentInfoes.thirdGradeStudentInfoes[i].studentNumber})`);
    }
    const values = firstGradeStudents.concat(secondGradeStudents).concat(thirdGradeStudents).join(', ');

    await new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            db.run('DELETE FROM student');
            if (values !== '') {
                db.run('INSERT INTO student (unique_key, voted, grade, name, student_number) VALUES ' + values);
            }
            db.run('COMMIT', [], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    });
    return;
}

export async function getKeyStatus(): Promise<KeyStatus> {
    const firstGradeNotVotedPromise: Promise<number> = new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) FROM student WHERE grade = 1 and voted = 0', [], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row['COUNT(*)']);
        });
    });
    const firstGradeVotedPromise: Promise<number> = new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) FROM student WHERE grade = 1 and voted = 1', [], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row['COUNT(*)']);
        });
    });
    const secondGradeNotVotedPromise: Promise<number> = new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) FROM student WHERE grade = 2 and voted = 0', [], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row['COUNT(*)']);
        });
    });
    const secondGradeVotedPromise: Promise<number> = new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) FROM student WHERE grade = 2 and voted = 1', [], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row['COUNT(*)']);
        });
    });
    const thirdGradeNotVotedPromise: Promise<number> = new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) FROM student WHERE grade = 3 and voted = 0', [], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row['COUNT(*)']);
        });
    });
    const thirdGradeVotedPromise: Promise<number> = new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) FROM student WHERE grade = 3 and voted = 1', [], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row['COUNT(*)']);
        });
    });

    return {
        numberOfFirstGradeNotVotedKeys: await firstGradeNotVotedPromise,
        numberOfFirstGradeVotedKeys: await firstGradeVotedPromise,
        numberOfSecondGradeNotVotedKeys: await secondGradeNotVotedPromise,
        numberOfSecondGradeVotedKeys: await secondGradeVotedPromise,
        numberOfThirdGradeNotVotedKeys: await thirdGradeNotVotedPromise,
        numberOfThirdGradeVotedKeys: await thirdGradeVotedPromise
    };
}

export async function getAdminPassword(): Promise<string> {
    return await new Promise<string>((resolve, reject) => {
        db.serialize(() => {
            db.get('SELECT * from admin_password', [], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row.password);
            });
        });
    });
}

export async function compareAdminPassword(plaintextPassword: string): Promise<boolean> {
    assertValidAdminPassword(plaintextPassword);
    const adminPassword = await getAdminPassword();
    return await bcrypt.compare(plaintextPassword, adminPassword);
}

export async function setAdminPassword(newPlaintextPassword: string): Promise<void> {
    assertValidAdminPassword(newPlaintextPassword);
    const hash = await bcrypt.hash(newPlaintextPassword, saltRounds);
    await new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('UPDATE admin_password SET password = ?', [hash], err => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    });
    return;
}

export async function getPollName(): Promise<string> {
    return await new Promise<string>((resolve, reject) => {
        db.get('SELECT * from poll_name', [], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row.name);
        });
    });
}

export async function setPollName(name: string): Promise<void> {
    await new Promise((resolve, reject) => {
        db.get('UPDATE poll_name SET name = ?', [name], err => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
    return;
}

export async function getState(): Promise<string> {
    return await new Promise<string>((resolve, reject) => {
        db.get('SELECT * from state', [], (err, row) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(row.state);
        });
    });
}

export async function setState(state: string): Promise<void> {
    await new Promise<void>((resolve, reject) => {
        db.get('UPDATE state SET state = ?', [state], err => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
    return;
}

export async function getStatus(): Promise<Status> {
    const promiseCandidates = getCandidates();
    const promiseKeyStatus = getKeyStatus();
    const promiseState = getState();
    const promisePollName = getPollName();

    return {
        candidates: await promiseCandidates,
        keyStatus: await promiseKeyStatus,
        state: await promiseState,
        pollName: await promisePollName
    };
}
