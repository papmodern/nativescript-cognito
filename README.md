# Nativescript-cognito

Consume aws cognito service with nativescript. Android and iOS
Clouding co.
http://clouding.ca

## Installation

Describe your plugin installation steps. Ideally it would be something like:

```javascript
tns plugin add nativescript-cognito
```

## Usage 

```javascript
const cognito = new Cognito("Your user pool id", "your client id");

cognito.authenticate(username, password).then(token => ...)

cognito.signUp(username, password, {
    name: "Name", 
    email: "Email",
    phone: "Phone",
    ...
}).then(res => ...)

cognito.confirmRegistration(username, code).then(username => {})
...
```


## License

MIT License Copyright (c) 2019
