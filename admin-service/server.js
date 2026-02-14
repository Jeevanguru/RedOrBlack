import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const users = {
  "22202607092003": {
    user_id: "jeeva",
    operatorId: "vaayu_100",
    balance: 500,
  },
  "22202609092002": {
    user_id: "player",
    operatorId: "agni_777",
    balance: 2500,
  },
  "22202611092004": {
    user_id: "alex",
    operatorId: "indra_101",
    balance: 1500,
  },
  "22202612092005": {
    user_id: "nina",
    operatorId: "sura_202",
    balance: 3200,
  },
  "22202613092006": {
    user_id: "sam",
    operatorId: "vayu_303",
    balance: 800,
  },
  "22202614092007": {
    user_id: "lily",
    operatorId: "agni_404",
    balance: 950,
  }
};

const games = {
  "11": {
    gameName: "Red or Black game",
  },
  "12": {
    gameName: "real time game engine",
  }
};

// -------------------- USER DETAIL API --------------------
app.get("/service/user/detail", (req, res) => {
  console.log("request for user details");

  const token = req.headers.token;
  const gameId = req.headers.game_id;

  if (!token || !gameId) {
    return res.status(401).json({
      success: false,
      message: "Mandatory Parameters missing in headers",
    });
  }

  const user = users[token];
  const game = games[gameId];

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Invalid token / user not found",
    });
  }

  if (!game) {
    return res.status(404).json({
      success: false,
      message: `No Game found with gameId ${gameId}`,
    });
  }

  console.log("near to complete providing user detail");

  return res.json({
    success: true,
    user,
  });
});


// -------------------- BALANCE UPDATE API --------------------
// This is required because your sendRequestToAccounts() hits this endpoint:
// POST `${service_base_url}/service/operator/user/balance/v2`
app.post("/service/operator/user/balance/v2", (req, res) => {
  console.log("request for balance update");

  const token = req.headers.token;
  if (!token) {
    return res.status(401).json({
      status: false,
      message: "Token missing in headers",
    });
  }

  const user = users[token];
  if (!user) {
    return res.status(404).json({
      status: false,
      message: "Invalid token / user not found",
    });
  }

  const { amount, txn_type, txn_id, txn_ref_id, description } = req.body;

  if (!amount || txn_type === undefined) {
    return res.status(400).json({
      status: false,
      message: "amount and txn_type are mandatory",
    });
  }

  const amt = Number(amount);

  if (isNaN(amt)) {
    return res.status(400).json({
      status: false,
      message: "amount must be a valid number",
    });
  }

  // txn_type: 0 => DEBIT, 1 => CREDIT
  if (txn_type === 0) {
    if (user.balance < amt) {
      return res.status(400).json({
        status: false,
        message: "Insufficient balance",
        balance: user.balance,
      });
    }
    user.balance -= amt;
  } else if (txn_type === 1) {
    user.balance += amt;
  } else {
    return res.status(400).json({
      status: false,
      message: "Invalid txn_type (0 = DEBIT, 1 = CREDIT)",
    });
  }

  console.log("Balance updated successfully");

  return res.json({
    status: true,
    message: "Balance updated successfully",
    txn_id: txn_id || null,
    txn_ref_id: txn_ref_id || null,
    description: description || null,
    balance: user.balance,
    user_id: user.user_id,
    operatorId: user.operatorId,
  });
});


// -------------------- SERVER START --------------------
const PORT = process.env.PORT || 5800;
app.listen(PORT, () => {
  console.log(`Admin service running on port ${PORT}`);
});

