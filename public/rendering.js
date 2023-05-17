import { getApi, postApi } from "./api.js";

const main = document.querySelector("main");

export const loadPage = async () => {
  const res = await getApi("/api/loggedin");
  if (res) {
    console.log("welcome in " + res.user.user_name);
    console.log(res.user);
    renderUserPage(res.user);
  } else {
    console.log("nope");
  }
};

const renderUserPage = async (user) => {
  const loggedUser = document.querySelector("#loggedUser");
  main.innerHTML = "";
  loggedUser.innerHTML = `
    <p>user logged in: </p>
    <h2>${user.user_name}</h2>
    `;
  await renderNav(user);
};

const renderNav = async (user) => {
  const nav = document.querySelector("nav");
  nav.innerHTML = `
    <div class="nav-container">
        <div>
            <button id="newAccount">New account</button>
            <select id="userAccounts"></select>
        </div>
        <div>
            <button id="logoutBtn">Logout</button>
        </div>
    </div>
    `;
  const userAccounts = document.querySelector("#userAccounts");

  const logoutBtn = document.querySelector("#logoutBtn");
  logoutBtn.addEventListener("click", async () => {
    await postApi("/api/logout");
    location.reload();
  });
  const newAccount = document.querySelector("#newAccount");
  newAccount.addEventListener("click", () => {
    renderNewAccountForm(user);
  });
  renderUserAccounts(userAccounts, user._id);
  userAccounts.addEventListener("change", async () => {
    await accountInfo(userAccounts.value);
  });
};

const accountInfo = async (id) => {
  main.innerHTML = "";
  const res = await getApi(`/api/account/${id}`);
  console.log(res.singleAccount);
  const { account_name, _id, amount } = res.singleAccount;
  const section = document.createElement("section");
  section.classList = "information flex-col";
  section.innerHTML = `
      <div class="flex-between">
        <div>
          <h2>${account_name}</h2>
          <h3>Account no. ${_id}</h3>
        </div>
      <h4>${amount},- BG</h4>
      </div>
      <div class="flex-between marg-sides">
        <div>
          <button id="accountWithdraw">Withdraw</button>
          <button id="accountDeposit">Deposit</button>
        </div>
        <div>
          <button id="accountDelete">Delete</button>
        </div>
      </div>
    `;
  main.append(section);
};

const renderUserAccounts = async (elem, userId) => {
  const res = await getApi(`/api/accounts/${userId}`);
  console.log(res.userAccounts, "all accounts");
  createOptions(elem, res.userAccounts);
  if (elem.value) {
    await accountInfo(elem.value);
  }
};

const createOptions = (elem, optionData) => {
  if (optionData.length < 1) {
    const option = document.createElement("option");
    option.innerText = "No accounts :(";
    option.value = "";
    elem.append(option);
  } else {
    optionData.forEach((e) => {
      const { account_name, _id, amount } = e;
      const option = document.createElement("option");
      option.innerText = `${account_name}, ${_id} - ${amount} BG`;
      option.value = _id;
      elem.append(option);
    });
  }
};

const renderNewAccountForm = (user) => {
  main.innerHTML = `
    <form id="newAccountForm">
      <h2>New account</h2>
      <input type="text" id="accountName" placeholder="Account name" required>
      <input type="number" min="1" max="100000" id="accountAmount" placeholder="Amount to deposit" required>
      <div class="buttonRight">
        <button>Create account</button>
      </div>
    </form>
    `;
  const newAccountForm = document.querySelector("#newAccountForm");
  newAccountForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    newAccountForm.disable = true;
    try {
      const accountData = {
        account_name: accountName.value,
        amount: accountAmount.value,
        ownerId: user._id,
      };
      await postApi("/api/accounts", accountData);
    } catch (err) {
      console.log(err);
    }
    newAccountForm.disable = false;
    renderUserPage(user);
  });
};
