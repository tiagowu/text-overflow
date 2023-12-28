// Setup database with initial test data.
// Include an admin user.
// Script should take admin credentials as arguments as described in the requirements doc.

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const User = require("./models/users");
const Answer = require("./models/answers");
const Question = require("./models/questions");
const Tag = require("./models/tags");
const Comment = require("./models/comments");

const mongoDB = "mongodb://127.0.0.1:27017/fake_so";
// PUT YOUR URL HERE

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

if (process.argv.length < 4) {
  console.log("Please provide an admin username and password!");
  process.exit(1);
}

async function commentCreate(text, comm_by, comm_date_time, upvotes, votes) {
  const comment = new Comment({
    text,
    comm_by,
    comm_date_time,
    upvotes,
    votes,
  });
  return comment.save();
}

async function userCreate(
  username,
  email,
  password,
  reputation,
  questions_asked,
  member_since
) {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = new User({
    username,
    email,
    password: hashedPassword,
    reputation,
    questions_asked,
    member_since,
  });
  return user.save();
}

async function answerCreate(
  text,
  comments,
  ans_by,
  ans_date_time,
  upvotes,
  downvotes,
  votes
) {
  const answer = new Answer({
    text,
    comments,
    ans_by,
    ans_date_time,
    upvotes,
    downvotes,
    votes,
  });
  return answer.save();
}

async function questionCreate(
  title,
  summary,
  text,
  tags,
  answers,
  comments,
  asked_by,
  ask_date_time,
  views,
  upvotes,
  downvotes,
  votes
) {
  const question = new Question({
    title,
    summary,
    text,
    tags,
    answers,
    comments,
    asked_by,
    ask_date_time,
    views,
    upvotes,
    downvotes,
    votes,
  });
  return question.save();
}

async function tagCreate(name, created_by, questions) {
  const tag = new Tag({
    name,
    created_by,
    questions,
  });
  return tag.save();
}

const populate = async () => {
  await Tag.deleteMany({});
  await Answer.deleteMany({});
  await Question.deleteMany({});
  await User.deleteMany({});
  await Comment.deleteMany({});

  const admin = await userCreate(
    process.argv[2],
    "admin@fakeso.com",
    process.argv[3],
    0,
    []
  );

  const u1 = await userCreate("newbie", "newbie@gmail.com", "fakeso", 100, []);
  const u2 = await userCreate("john", "john@gmail.com", "fakeso", 50, []);
  const u3 = await userCreate("bob", "bob@gmail.com", "fakeso", 0, []);

  const c1 = await commentCreate(
    "Interesting post on a Fake Stack Overflow",
    u1,
    new Date("02/3/2022"),
    [],
    0
  );

  const c2 = await commentCreate(
    "I totally agree!!",
    u2,
    new Date("09/28/2022"),
    [],
    0
  );

  const a1 = await answerCreate(
    "I'm pretty sure you can ask Professor K about this issue.",
    [c1, c2],
    u3,
    new Date("02/25/2023"),
    [],
    [],
    0
  );

  const a2 = await answerCreate(
    "use li to store, use j instruction followed by label name to jump, and label: is how you create a label. Label names must be unique",
    [],
    u2,
    new Date("02/19/2023"),
    [],
    [],
    0
  );

  const a3 = await answerCreate(
    "You can try looking up the VSCode's support page for mobile devices. Hope this'll help.",
    [c2],
    u3,
    new Date("02/3/2022"),
    [],
    [],
    0
  );

  const a4 = await answerCreate(
    "You can find more information about handing UI State in the lecture slide on React.",
    [c1, c2],
    u2,
    new Date("02/16/2023"),
    [],
    [],
    0
  );

  const t1 = await tagCreate("react", u1);
  const t2 = await tagCreate("javascript", u1);
  const q1 = await questionCreate(
    "Need help with route, JS, BCrypt",
    "Have exam, I really need to pass this exam",
    "I'm having trouble understanding the concept behind react. I understand the basic component making and manipulating the component; however, the section talking about 'Handling UI State and Lifecycle', I am having difficulty understanding it. Can someone help explain this? Also any information about react is helpful!",
    [t1, t2],
    [a1, a4],
    [c1, c2],
    u1,
    new Date("02/15/2023"),
    31,
    [],
    [],
    0
  );

  const t3 = await tagCreate("Assembly Code", u2);
  const t4 = await tagCreate("shared-preferences", u2);
  const q2 = await questionCreate(
    "IPad Supporting VSCode",
    "Got a IPad Air, how do I code on it?",
    "I know it's possible to code on other devices like ipads. I've seen many video tutorials on setting up softwares for coding but I specifically want to use VSCode. This is cause I'm already used to the VSCode's UI.",
    [t2, t3, t4],
    [a3],
    [],
    u2,
    new Date("01/31/2022"),
    121,
    [],
    [],
    0
  );
  t2.questions += 1;
  await t2.save();

  const t5 = await tagCreate("MIPS", u3);
  const q3 = await questionCreate(
    "Coding in Assembly",
    "CSE220 requires me to code in MIPS, help.",
    "Can someone please explain how to store variables, use jump instructions, and how to creating a label?",
    [t3, t5],
    [a1, a3],
    [c1],
    u3,
    new Date("01/1/2022"),
    2,
    [],
    [],
    0
  );
  t3.questions += 1;
  await t3.save();

  u2.questions_asked.push(q1);
  await u2.save();
  u1.questions_asked.push(q2);
  await u1.save();
  u3.questions_asked.push(q3);
  await u3.save();
  if (db) db.close();
  console.log("done");
};

populate().catch((err) => {
  console.log("ERROR: " + err);
  if (db) db.close();
});
