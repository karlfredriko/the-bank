import { getApi, postApi } from "./api.js";
import { loadPage } from "./rendering.js";

const main = document.querySelector("main");

const createUsername = document.querySelector("#createUsername");
const createFirstName = document.querySelector("#createFirstName");
const createLastName = document.querySelector("#createLastName");
const createPassword = document.querySelector("#createPassword");
const createUserForm = document.querySelector("#createUserForm");

const loginUsername = document.querySelector("#loginUsername");
const loginPassword = document.querySelector("#loginPassword");
const loginForm = document.querySelector("#loginForm");

const newBtn = document.querySelector("#new");

loadPage();

const toggleHidden = () => {
  loginForm.classList.toggle("hidden");
  createUserForm.classList.toggle("hidden");
};

newBtn.addEventListener("click", toggleHidden);

const login = async () => {
  const userData = {
    user_name: loginUsername.value,
    password: loginPassword.value,
  };
  const result = await postApi("/api/login", userData);
  console.log(result);
};

const createUser = async () => {
  const userData = {
    user_name: createUsername.value,
    first_name: createFirstName.value,
    last_name: createLastName.value,
    password: createPassword.value,
  };
  await postApi("/api/user", userData);
};

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginForm.disable = true;
  try {
    await login();
    loginForm.reset();
    loadPage();
  } catch (err) {
    console.log(err, "login-error");
  }
  loginForm.disable = false;
});

createUserForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  createUserForm.disable = true;
  try {
    await createUser();
    console.log("user created");
    createUserForm.reset();
    toggleHidden();
  } catch (err) {
    console.log(err);
  }
  createUserForm.disable = false;
});
