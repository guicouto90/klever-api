const chai = require('chai');
const sinon = require('sinon');
const chaiHTTP = require('chai-http');

chai.use(chaiHTTP);

const { expect } = chai;
const { MongoClient } = require('mongodb');
const server = require('../api/server');

const { getConnection } = require('./connectionMock');

describe('GET /tx/:tx', () => {
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
      const txConnection = connectionMock.db('klever').collection('txs');
      await txConnection.insertOne(
        {
          addresses: [
            {
              address: "bc1qcu8p7x0rtepvn3evqvqdtccexavcdnf33m8kmw",
              value: "1000"
            },
            {
              address: "bc1qz2r368qvvhmazahxgd5cf67tvhghtpm3j9cpda",
              value: "15030737"
            }
          ],
          block: 2,
          txid: "307ff065a270c7df5af6cff0d3fecd46f1635660e471afa534e1adcf0da56a6d",
          confirmation: 0
        }
      )
      response = await chai.request(server)
        .get('/tx/307ff065a270c7df5af6cff0d3fecd46f1635660e471afa534e1adcf0da56a6d')
    });

    it('Return status 200', () => {
      expect(response).to.have.status(200);
    });

    it('Return an object in the body', () => {
      expect(response.body).to.be.an('object');
    });

    it('return a property "addresses", "block" and "txid" in the body', () => {
      expect(response.body).to.have.property('addresses');
      expect(response.body).to.have.property('block');
      expect(response.body).to.have.property('txid');
    });

    it('Property "block" has the value: 2', () => {
      expect(response.body.block).to.be.equals(2);
    })

    it('Property "txid" has the value: "307ff065a270c7df5af6cff0d3fecd46f1635660e471afa534e1adcf0da56a6d"', () => {
      expect(response.body.txid).to.be.equals('307ff065a270c7df5af6cff0d3fecd46f1635660e471afa534e1adcf0da56a6d');
    })

    it('Property "addresses" return an array"', () => {
      expect(response.body.addresses).to.be.an('array');
    })

    it('Property "addresses[0]" has an object"', () => {
      expect(response.body.addresses[0].address).to.be.equals('bc1qcu8p7x0rtepvn3evqvqdtccexavcdnf33m8kmw');
      expect(response.body.addresses[0].value).to.be.equals('1000');
    })

    it('Property "addresses[1]" has an object"', () => {
      expect(response.body.addresses[1].address).to.be.equals('bc1qz2r368qvvhmazahxgd5cf67tvhghtpm3j9cpda');
      expect(response.body.addresses[1].value).to.be.equals('15030737');
    })
  })

  describe('When the :tx is not valid or not found', () => {
    let response;
    before(async () => {
      response = await chai.request(server)
      .get('/tx/307ff065a270c7df5af6cff0d3fecd46f1635660e471afa534e1adcf0da56a6')
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

    it('Property "message" have the value: Txid not valid or doesnt exist', () => {
      expect(response.body.message).to.be.equals("Txid not valid or doesnt exist");
    });
  })
})