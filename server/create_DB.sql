BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"username" TEXT,
	"password" TEXT,
	"salt"	TEXT,
	"role"	TEXT
);

CREATE TABLE IF NOT EXISTS "tickets" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"category" TEXT,
	"state"	TEXT,
	"owner"	TEXT,
    "title" TEXT,
	"timestamp"	TEXT,
	"ownerId" INTEGER
);

CREATE TABLE IF NOT EXISTS "blocks" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"text"	TEXT,
	"author"	TEXT,
	"timestamp"	TEXT,
	"ticketId"	INTEGER
);

INSERT INTO "users" ("id","username","password","salt", "role") VALUES (1,'Vito','6f74e5081b5133336aad1847f70f076f1111ff86984d7e90403233cbe29519530ff1e890c31ba6c09db0c130992706f3f7f1b3347bb819244b71c1c73aba23dc','8243b7fa7e61e814ef0708306d8fa302ec096ffe1696409adc63ee305e1a69e2','admin');
INSERT INTO "users" ("id","username","password","salt", "role") VALUES (2,'Antonio','eac73b66a4b5638b384b7c282722c779d15748a68eda6cec80b90a72795df7e57d723f9069f78b711147aa7b5d5a70fd36e4776d22917081642b72ab72a4725e','925fa5dd3d21deefa0f6463c4ebd4fa1332e61727fd3cc5892fd3bf9475c5a53','admin');

INSERT INTO "users" ("id","username","password","salt", "role") VALUES (3,'Leonardo','b278b74e72841d45194f37ba1af1344be226213109dd0cf1796f0eaaf0d72df940212189250647e6d4acfe74f7df2e7d3699c1acf4809c2e37de8ff391ef7a15','0e956c837c8ecf2e53d9de926da1fb690baa6463f2abeaad83341d92f387dbb8','user');
INSERT INTO "users" ("id","username","password","salt", "role") VALUES (4,'Andrea','76e9e7d66291f0a67a89244b873157f925eecff892e724d8370868e4f0bc4a343fc6633260977b1a092a8f84e23a00d3a2176f0ebb1233a71acbadcc3811b2be','7ea71a16c5e6dc158fb0e52a96f7be8d4e3382b9ab71146d8eb89e97d8571e87','user');
INSERT INTO "users" ("id","username","password","salt", "role") VALUES (5,'Simone','652c31feaa9339d884843b430700ff20d8370d0b44811a2fba62c2a99d0515bfb4ec8655652e4d4110946235edea817a4afa8d74a1eaee9d9490ecb79ecfc148','e12c9c0d43ff96e4fc29d31844d0aca0cc49b96187725cbcc62c8b7cb9cb449a','user');


COMMIT;