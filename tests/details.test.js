const chai = require('chai');
const sinon = require('sinon');
const chaiHTTP = require('chai-http');

chai.use(chaiHTTP);

const { expect } = chai;
const { MongoClient } = require('mongodb');
const server = require('../api/server');

const { getConnection } = require('./connectionMock');

describe('GET /details/:address', () => {
  let connectionMock;

  before(async () => {
    connectionMock = await getConnection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
  });

  after(() => {
    MongoClient.connect.restore();
  })

  describe('Login complete successfully', () => {
    let response;
    before(async () => {
      const addressConnection = connectionMock.db('klever').collection('addresses');
      await addressConnection.insertOne(
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
      response = await chai.request(server)
        .get('/details/bc1q6qr0yk8y3ustkqf9l6addgvv42h052k3nvg89t')
    });

    it('Return status 200', () => {
      expect(response).to.have.status(200);
    });

    it('Return an object in the body', () => {
      expect(response.body).to.be.an('object');
    });

    it('return a property "address", "balanceTotal","balance", "totalTx" and "total" in the body', () => {
      expect(response.body).to.have.property('address');
      expect(response.body).to.have.property('balanceTotal');
      expect(response.body).to.have.property('balance');
      expect(response.body).to.have.property('totalTx');
      expect(response.body).to.have.property('total');
    });

    it('Property "address" has the value: "bc1q6qr0yk8y3ustkqf9l6addgvv42h052k3nvg89t"', () => {
      expect(response.body.address).to.be.equals('bc1q6qr0yk8y3ustkqf9l6addgvv42h052k3nvg89t');
    })

    it('Property "balanceTotal" has the value: "1000000"', () => {
      expect(response.body.balanceTotal).to.be.equals('1000000');
    })

    it('Property "totalTx" has the value: "1"', () => {
      expect(response.body.totalTx).to.be.equals(1);
    })

    it('Property "balance.confirmed" has the value: "1000000"', () => {
      expect(response.body.balance.confirmed).to.be.equals("1000000");
    })

    it('Property "total.sent" has the value: "0"', () => {
      expect(response.body.total.sent).to.be.equals("0");
    })

    it('Property "total.received" has the value: "1000000"', () => {
      expect(response.body.total.received).to.be.equals("1000000");
    })
  })

  describe('When the :address is not valid', () => {
    let response;
    before(async () => {
      response = await chai.request(server)
      .get('/balance/bc1q6qr0yk8y3ustkqf9l6addgvv42h052k3nvg89')
    });

    it('Return status 400', () => {
      expect(response).to.have.status(400);
    });

    it('Return an object in the body', () => {
      expect(response.body).to.be.an('object');
    });

    it('return a property "message" in the body', () => {
      expect(response.body).to.have.property('message');
    });

    it('Property "message" have the value: Bitcoin addres not valid', () => {
      expect(response.body.message).to.be.equals("Bitcoin addres not valid");
    });
  })

  describe('When the :address is not found', () => {
    let response;
    before(async () => {
      response = await chai.request(server)
      .get('/balance/bc1qcu8p7x0rtepvn3evqvqdtccexavcdnf33m8kmw')
    });

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
})