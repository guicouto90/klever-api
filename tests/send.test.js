const chai = require('chai');
const sinon = require('sinon');
const chaiHTTP = require('chai-http');

chai.use(chaiHTTP);

const { expect } = chai;
const { MongoClient } = require('mongodb');
const server = require('../api/server');

const { getConnection } = require('./connectionMock');
const { generateToken } = require('../middlewares/auth');

describe('POST /send', () => {
  let connectionMock;

  before(async () => {
    connectionMock = await getConnection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
  });

  after(() => {
    MongoClient.connect.restore();
  })

  describe('When tx is completed successfully', () => {
    let response;
    before(async () => {
      const addressCollection = connectionMock.db('klever').collection('addresses');
      await addressCollection.insertOne(
        {
          privateKey: "6b8cc16dcd9f7d3859b2bd208de4cd1097a0eda12e3c6649b196c37d7f16452e",
          password: "teste1",
          address: "bc1q6qr0yk8y3ustkqf9l6addgvv42h052k3nvg89t",
          balanceTotal: "1000000",
          totalTx: 1,
          balance: { confirmed: "1000000", unconfirmed: "0" },
          utxos: [ 
            { 
              txid: "afd6549f2a13f0a4a1fbe11fbb681dbc7fc457e3e8bc36e6e412f55f16fce6bc", 
              amount: "1000000", 
              confirmation: 3 } 
          ],
          total: { sent: "0", received: "1000000" }
        }
      )
      await addressCollection.insertOne({
          privateKey: "b7ff72131c6e00651cf673754ba51b5779229939ba945965d4b3a9760fd53c2f",
          password: "teste1",
          address: "bc1qrs8uah5awykjtswaalxrq345dt4rqa7reyjuwm",
          balanceTotal: "0",
          totalTx: 0,
          balance: { confirmed: "0", unconfirmed: "0" },
          utxos: [],
          total: { sent: "0", received: "0" }
      })
      const token = generateToken('6b8cc16dcd9f7d3859b2bd208de4cd1097a0eda12e3c6649b196c37d7f16452e');
      response = await chai.request(server)
        .post('/send')
        .set('authorization', token)
        .send({
          address: "bc1qrs8uah5awykjtswaalxrq345dt4rqa7reyjuwm",
          amount: "15000"
        })
    });

    it('Return status 201', () => {
      expect(response).to.have.status(201);
    });

    it('Return an object in the body', () => {
      expect(response.body).to.be.an('object');
    });

    it('return a property "message" in the body', () => {
      expect(response.body).to.have.property('message');
    });
    
  })

  describe('When the address filled is not found', () => {
    let response;
    const token = generateToken('6b8cc16dcd9f7d3859b2bd208de4cd1097a0eda12e3c6649b196c37d7f16452e');
    before(async () => {
      response = await chai.request(server)
        .post('/send')
        .set('authorization', token)
        .send({
          address: "bc1qrs8uah5awykjtswaalxrq345dt4rqa7reyjuw",
          amount: "15000"
        });
    })

    it('Return status 404', () => {
      expect(response).to.have.status(404);
    });

    it('Return an object in the body', () => {
      expect(response.body).to.be.an('object');
    });

    it('return a property "message" in the body', () => {
      expect(response.body).to.have.property('message');
    });

    it('Property "message" have the value: Bitcoin address not found', () => {
      expect(response.body.message).to.be.equals("Bitcoin address not found");
    });
  })

  describe('When there is no balance enough to do the transaction', () => {
    let response;
    const token = generateToken('6b8cc16dcd9f7d3859b2bd208de4cd1097a0eda12e3c6649b196c37d7f16452e');
    before(async () => {
      response = await chai.request(server)
        .post('/send')
        .set('authorization', token)
        .send({
          address: "bc1qrs8uah5awykjtswaalxrq345dt4rqa7reyjuwm",
          amount: "1500000000000"
        });
    })

    it('Return status 400', () => {
      expect(response).to.have.status(400);
    });

    it('Return an object in the body', () => {
      expect(response.body).to.be.an('object');
    });

    it('return a property "message" in the body', () => {
      expect(response.body).to.have.property('message');
    });

    it('Property "message" have the value: Balance not enough to complete the transaction', () => {
      expect(response.body.message).to.be.equals("Balance not enough to complete the transaction");
    });
  })

  describe('When there is no balance enough to do the transaction', () => {
    let response;
    const token = generateToken('6b8cc16dcd9f7d3859b2bd208de4cd1097a0eda12e3c6649b196c37d7f16452e');
    before(async () => {
      response = await chai.request(server)
        .post('/send')
        .set('authorization', token)
        .send({
          address: "bc1qrs8uah5awykjtswaalxrq345dt4rqa7reyjuwm",
          amount: "-1500000000000"
        });
    })

    it('Return status 400', () => {
      expect(response).to.have.status(400);
    });

    it('Return an object in the body', () => {
      expect(response.body).to.be.an('object');
    });

    it('return a property "message" in the body', () => {
      expect(response.body).to.have.property('message');
    });

    it('Property "message" have the value: The value cannot be less or equal 0', () => {
      expect(response.body.message).to.be.equals("The value cannot be less or equal 0");
    });
  })

  describe('When transaction has the same address for sent and received', () => {
    let response;
    const token = generateToken('6b8cc16dcd9f7d3859b2bd208de4cd1097a0eda12e3c6649b196c37d7f16452e');
    before(async () => {
      response = await chai.request(server)
        .post('/send')
        .set('authorization', token)
        .send({
          address: "bc1q6qr0yk8y3ustkqf9l6addgvv42h052k3nvg89t",
          amount: "15000"
        });
    })

    it('Return status 400', () => {
      expect(response).to.have.status(400);
    });

    it('Return an object in the body', () => {
      expect(response.body).to.be.an('object');
    });

    it('return a property "message" in the body', () => {
      expect(response.body).to.have.property('message');
    });

    it('Property "message" have the value: Transaction cannot be done. Its not allowed to transfer for the same address which is sending the value.', () => {
      expect(response.body.message).to.be.equals("Transaction cannot be done. Its not allowed to transfer for the same address which is sending the value.");
    });
  })

  describe('When address is not filled', () => {
    let response;
    const token = generateToken('6b8cc16dcd9f7d3859b2bd208de4cd1097a0eda12e3c6649b196c37d7f16452e');
    before(async () => {
      response = await chai.request(server)
        .post('/send')
        .set('authorization', token)
        .send({
          amount: "15000"
        });
    })

    it('Return status 400', () => {
      expect(response).to.have.status(400);
    });

    it('Return an object in the body', () => {
      expect(response.body).to.be.an('object');
    });

    it('return a property "message" in the body', () => {
      expect(response.body).to.have.property('message');
    });

    it('Property "message" have the value: \"address\" is required', () => {
      expect(response.body.message).to.be.equals("\"address\" is required");
    });
  })

  describe('When the amount is not filled', () => {
    let response;
    const token = generateToken('6b8cc16dcd9f7d3859b2bd208de4cd1097a0eda12e3c6649b196c37d7f16452e');
    before(async () => {
      response = await chai.request(server)
        .post('/send')
        .set('authorization', token)
        .send({
          address: "bc1qrs8uah5awykjtswaalxrq345dt4rqa7reyjuwm"
        });
    })

    it('Return status 400', () => {
      expect(response).to.have.status(400);
    });

    it('Return an object in the body', () => {
      expect(response.body).to.be.an('object');
    });

    it('return a property "message" in the body', () => {
      expect(response.body).to.have.property('message');
    });

    it('Property "message" have the value: \"amount\" is required', () => {
      expect(response.body.message).to.be.equals("\"amount\" is required");
    });
  })

  describe('When there is no token filled', () => {
    let response;
    const token = generateToken('6b8cc16dcd9f7d3859b2bd208de4cd1097a0eda12e3c6649b196c37d7f16452e');
    before(async () => {
      response = await chai.request(server)
        .post('/send')
        .set('authorization', '')
        .send({
          address: "bc1qrs8uah5awykjtswaalxrq345dt4rqa7reyjuwm"
        });
    })

    it('Return status 400', () => {
      expect(response).to.have.status(400);
    });

    it('Return an object in the body', () => {
      expect(response.body).to.be.an('object');
    });

    it('return a property "message" in the body', () => {
      expect(response.body).to.have.property('message');
    });

    it('Property "message" have the value: jwt must be provided', () => {
      expect(response.body.message).to.be.equals("jwt must be provided");
    });
  })

  describe('When there is no token filled', () => {
    let response;
    const token = generateToken('6b8cc16dcd9f7d3859b2bd208de4cd1097a0eda12e3c6649b196c37d7f16452e');
    before(async () => {
      response = await chai.request(server)
        .post('/send')
        .set('authorization', 'sasdasdas')
        .send({
          address: "bc1qrs8uah5awykjtswaalxrq345dt4rqa7reyjuwm"
        });
    })

    it('Return status 400', () => {
      expect(response).to.have.status(400);
    });

    it('Return an object in the body', () => {
      expect(response.body).to.be.an('object');
    });

    it('return a property "message" in the body', () => {
      expect(response.body).to.have.property('message');
    });

    it('Property "message" have the value: jwt malformed', () => {
      expect(response.body.message).to.be.equals("jwt malformed");
    });
  })

})