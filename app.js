const express = require("express");
const session = require("express-session");
const passport = require("passport");
const WebAppStrategy = require("ibmcloud-appid").WebAppStrategy;
const app = express();

app.use(
  session({
    secret: "123456",
    resave: true,
    saveUninitialized: true,
  })
);

passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((user, cb) => cb(null, user));

app.use(passport.initialize());
app.use(passport.session());

// Configure the SAML strategy
passport.use(
  new WebAppStrategy({
    tenantId: "6bbb64ac-1bfd-4b95-bd2c-5c55b110f82d",
    clientId: "78514749-3b65-4ab7-a73b-10adda29e930",
    secret: "NzgwYWYyZDEtN2VjZC00NmI5LTk0ZGUtYmVjMGQyNDk2YmE2",
    oauthServerUrl:
      "https://eu-de.appid.cloud.ibm.com/oauth/v4/6bbb64ac-1bfd-4b95-bd2c-5c55b110f82d",
    redirectUri: "http://localhost:3000/api/iam/callback",
    samlOptions: {
      // Store the SAML response in req.user
      passReqToCallback: true,
    },
  })
);

// Define the authentication routes
app.get("/api/iam/login", passport.authenticate(WebAppStrategy.STRATEGY_NAME)); // {successRedirect: "/",forceLogin: true,}

app.get(
  "api/iam/callback",
  passport.authenticate(WebAppStrategy.STRATEGY_NAME),
  (req, res) => {
    console.log("req.user: ", req.user);
    // Handle the SAML response
    // ...
    res.redirect("/");
  }
);

app.get("/api/iam/logout", (req, res) => {
  req.logout(); // WebAppStrategy.logout(req);
  res.redirect("/");
});

// Define a protected route that requires authentication
app.get(
  "/api/iam//protected",
  passport.authenticate(WebAppStrategy.STRATEGY_NAME),
  (req, res) => {
    res.send(`Hello ${req.user.name}!`);
  }
);

// Protect the whole app
app.use(passport.authenticate(WebAppStrategy.STRATEGY_NAME));

// Make sure only requests from an authenticated browser session can reach /api
// app.use("/api", (req, res, next) => {
//   if (req.user) {
//     next();
//   } else {
//     res.status(401).send("Unauthorized1");
//   }
// });

// The /api/user API used to retrieve name of a currently logged in user
app.get("/api/iam/user", (req, res) => {
  res.json({
    user: {
      name: req.user.given_name,
      email: req.user.email,
    },
  });
});

// Serve static resources
app.use(express.static("./public"));

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
