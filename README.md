# klever-api 

## About:
It's about a technical challenge related to a selective process for Klever Exchange.

## Technologies used on the project:
- Node.js;
- Express;
- MongoDB;
- Jsonwebtoken;
- Insomnia.

## Use instructions:

- Clone the repository and install the dependencies with command "npm install".
- The command npm start is used to run the application. The application will use the port 3001.
- The command npm test is used to run the integration tests.
- The aplication was developed using principles of MSC arquitecture.
- You must create .env file containing property "SECRET" with a password, which will create the JWToken.

## The challenge:

The Challenge 
1. The application will provide an API endpoint ("/details/{address}") which will receive a Bitcoin address and return the bitcoin address data. 
This endpoint should organize data like this json: 
```json
{ 
  "address" : "bc1qyzxdu4px4jy8gwhcj82zpv7qzhvc0fvumgnh0r", 
  "balance" : "144011754", 
  "totalTx" : 17000, 
  "balance" : { 
    "confirmed" :"1321321", 
    "unconfirmed": "123213" 
  }, 
  "total": { 
    "sent": "1189163719343", 
    "received": "1189307731097" 
  } 
}
```
2. The application will provide an API endpoint ("/balance/{address}") which will receive a Bitcoin address and compute the Confirmed/Unconfirmed balance based on the UTXO (unspent transaction output) list for that address. If "confirmations" < 2, the "value" must account for Unconfirmed Balance, otherwise must account for Confirmed Balance. 
This endpoint should organize data like this json: 
```json
{ 
  "confirmed": "1312321321321", 
  "unconfirmed": "12321321" 
}
```
3. The application will provide an API endpoint ("/send") which will receive a Bitcoin address and the amount of btc you want to send and select the UTXO needed to make this send works. 
This endpoint should organize data like this json: 
```json
{ 
  "utxos": [ 
    { 
      "txid": "9ec20061fc37196c2ca689c36b002b786d461ee054a0557793be1eba11163932", 
      "amount": "17880859" 
    }, 
    { 
      "txid": "ee95bfb4a45c8e388447c2873893bc4c5aaee5083d0436017d3ae2bd6d0c38b9", 
      "amount": "729049" 
    }, 
    ... 
  ] 
}
```
4. The application will provide an API endpoint ("/tx/{tx}") which will receive a Transaction ID and compute the addresses and how much bitcoin which address receive in the given transaction. 
This endpoint should organize data like this json: 
```json
{ 
  "addresses": [ 
    { 
      "address": "bc1qyzxdu4px4jy8gwhcj82zpv7qzhvc0fvumgnh0r", 
      "value": "10000000", 
    }, 
    ... 
  ], 
  "block": 675674, 
  "txID": "3654d26660dcc05d4cfb25a1641a1e61f06dfeb38ee2279bdb049d018f1830ab" 
}
``` 
This is a return of a list of address that spent/receive money in this transaction 

## Project explanation:

## Routes:
  ##### Address:
  This route is used to create a new bitcoin address with hash bech32.
  - Method post('/address/') is used to create new addresses. The first address created is going to have a random bitcoin balance. The second address ahead, is going to be created without balance. It's has to be filled with fields below:
  ```json
    {
      "password": "Type string with at least 6 characters"
    }
  ```
  The return will be like the example below:
  ```json
    {
	    "Private key": "9b1c3110e953036e3f3ce3e3cb4333a6c59c8b9888b1bc3f3c7ef3af25a75cc1",
	    "Public key": "bc1qg48r3y8nnrtrqs2yx2dd372aym4f050qyt7npk"
    }
  ```
  
  #### Login:
  This route is used to log in to the application. The return of it is going to be a token JWT.
  - Method post('/login') for new logins. It's has to be filled with fields below:
  ```json
    {
	    "address": "A valid bitcoin address already registered",
	    "privateKey": "A valid private key bitcoin already registered, and related with the address above",
	    "password": "A valid password, registered for this address"
    }
  ```
  The return will be like the example below:
  ```json
    {
	  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcml2YXRlS2V5IjoiYjJjNzJlMDA2OGJmMWFlZjk3NjU5NWE2ZDdjZDc4ZGZlZGM0YTg0MDhjZTQ3N2ZlMWY5YTc2YzkyNjUzZTNkYyIsImlhdCI6MTY1MjMwNzYyOCwiZXhwIjoxNjUyOTEyNDI4fQ.AR4_FoGf-Nwjo06XUeKmdj3XEp_5Tk8dg5QjUUd2dzQ"
    }
  ```
  #### Balance:
  This route is used to get a balance of an specific address.
  - Method get('/balance/:address') to list a balance of an specific address. The address has to be an address already registered.
    The return will be like the example below:
    ```json
    {
	    "confirmed": "66518480",
	    "unconfirmed": "0"
    }
    ```
  
  #### Send:
  This route is used to make transferes between accounts registered.
  - Method post('/send') to make the transfers between accounts.
    First you have to log in with the address which is going to sent the value, then you get the token provided, and use it on the headers, using the "authorization" word as key.
    Then you have to fill the fields as the example bellow:
    ```json
    {
	    "address": "A valid bitcoin address already registered. This address will receive the value",
	    "amount": "The value is an String, and cant be less or equal 0"
    }
    ```
    The return will be like the example bellow:
    ```json
    {
	    "message": "Tx 445f217eacda2a3f5e21870a76a897077a96d49376e98871b834f303af4f7a24 completed"
    }
    ```
  - Method put('/send/:txid') to update the field confirmation. Each click will add one on confirmation field.
    The "txid" has to be from an transaction already registered.
    This method has no return.
  
  #### TX:
  This route is used to list an specific transaction already registered.
  - Method get('/tx/:tx'). The :tx has to be an transaction id already registered.
    The return will be like the example bellow:
    ```json
    {
	    "addresses": [
		    {
			    "address": "bc1qcu8p7x0rtepvn3evqvqdtccexavcdnf33m8kmw",
			    "value": "1000"
		    },
		    {
			    "address": "bc1qz2r368qvvhmazahxgd5cf67tvhghtpm3j9cpda",
			    "value": "15030737"
		    }
	    ],
	    "block": 2,
	    "txid": "307ff065a270c7df5af6cff0d3fecd46f1635660e471afa534e1adcf0da56a6d"
    }
    ```
  
  #### UTXOS:
  This route is used to list the utxos registered for an specific address.
  - Method get('/utxos/:address'). The :address has to be an address already registered.
    The return will be like the example bellow:
    ```json
       {
	      "utxos": 
          [
		        {
			        "txid": "223d75271dce5abc006a9de40e6a8d145d75f4174c81e5bdb4f0eef61218da9c",
			         "amount": "12059413",
			         "confirmation": 3
		        }
	        ] 
       }
    ```

  ## Things to do soon:
  - More tests, try to focus more on unit tests;
  - "Dockerizar" the application;
  - Fix a bug that happens when utxo value is less than amount of transfer;
  - Replace mongo DB for a relational Database.
  - Deploy on Heroku;
  
  ## Contact
  Any doubt or sugestion, please contact me by:
  - Email: gui.couto90@yahoo.com.br
  - LinkedIn: https://www.linkedin.com/in/guicouto90/
  
  
 