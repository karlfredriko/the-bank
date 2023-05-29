import { getApi, postApi, putApi } from "./api.js";

const main = document.querySelector("main");

export const loadPage = async () => {
  const res = await getApi("/api/loggedin");
  if (res) {
    renderUserPage(res.user);
  }
};

const renderUserPage = async (user) => {
  const loggedUser = document.querySelector("#loggedUser");
  main.innerHTML = "";
  const { user_name, first_name, last_name } = user;
  loggedUser.innerHTML = `
  <div class="user">
    <p>logged in: </p>
    <h2>"${user_name}"</h2>
  </div>
  <div>
    <h3 class="user-name">${first_name} ${last_name}</h3>
  </div>
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
  const { account_name, _id, amount, ownerId } = res.singleAccount;
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
          <input type="number" min="1" max="100000" class="width-7" id="amountToChange" placeholder="Select amount" required>
        </div>
        <div>
          <button id="accountDelete">Delete</button>
        </div>
      </div>
    `;
  main.append(section);
  const amountToChange = document.querySelector("#amountToChange");
  const deleteBtn = document.querySelector("#accountDelete");
  deleteBtn.addEventListener("click", async () => {
    confirmAndDelete(res.singleAccount);
    loadPage();
  });
  const withdrawBtn = document.querySelector("#accountWithdraw");
  const userAccounts = document.querySelector("#userAccounts");
  withdrawBtn.addEventListener("click", async () => {
    if (+amountToChange.value < 0) {
      alert(
        `You can't withdraw a negative number, please input a valid number.`
      );
    } else {
      const newTotal = +amount - +amountToChange.value;
      if (amount === 0) {
        alert(
          `You can't withdraw from ${account_name} because it is currently empty.`
        );
        return;
      } else if (newTotal < 0) {
        alert(`You can't withdraw more BG's than ${amount} from this account.`);
      } else {
        updateAmount(newTotal, _id);
        updateOption(res.singleAccount, newTotal);
        accountInfo(_id);
      }
    }
  });
  const depositBtn = document.querySelector("#accountDeposit");
  depositBtn.addEventListener("click", async () => {
    if (+amountToChange.value < 0) {
      alert(
        `You can't deposit a negative number, please input a valid number.`
      );
    } else {
      const newTotal = +amountToChange.value + +amount;
      updateAmount(newTotal, _id);
      updateOption(res.singleAccount, newTotal);
      accountInfo(_id);
    }
  });
};
const updateAmount = async (amount, id) => {
  const data = { amount };
  const res = await putApi(`/api/account/update/${id}`, data);
};
const confirmAndDelete = async (accountInfo) => {
  const { account_name, _id, amount } = accountInfo;
  let info = `Are you sure you want to delete "${account_name}"?`;
  if (+amount > 0) {
    info += `\n${amount} BG, will be automatically withdrawn and sent to you upon deletion.`;
  }
  if (confirm(info)) {
    await postApi(`/api/account/delete/${_id}`);
  }
};
const updateOption = (accountInfo, newAmount) => {
  const { account_name, _id } = accountInfo;
  const optionElem = document.querySelector(`#_${_id}`);
  optionElem.innerText = `${account_name}, ${_id} - ${newAmount} BG`;
};

const renderUserAccounts = async (elem, userId) => {
  elem.innerHTML = "";
  const res = await getApi(`/api/accounts/${userId}`);
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
      let option = document.createElement("option");
      option.innerText = `${account_name}, ${_id} - ${amount} BG`;
      option.value = _id;
      option.id = `_${_id}`;
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
