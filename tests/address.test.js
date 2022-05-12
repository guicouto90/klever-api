const chai = require('chai');
const sinon = require('sinon');
const chaiHTTP = require('chai-http');

chai.use(chaiHTTP);

const { expect } = chai;
const { MongoClient } = require('mongodb');
const server = require('../api/server');

const { getConnection } = require('./connectionMock');

describe('POST /address', () => {
  let connectionMock;

  before(async () => {
    connectionMock = await getConnection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
  });

  after(() => {
    MongoClient.connect.restore();
  })

  describe('Registered an address successfully', () => {
    let response;
    before(async () => {
      response = await chai.request(server)
        .post('/address')
        .send({
          password: "teste1"
        })
    });

    it('Return status 201', () => {
      expect(response).to.have.status(201);
    });

    it('Return an object in the body', () => {
      expect(response.body).to.be.an('object');
    });

    it('return a property "address" and "privateKey" in the body', () => {
      expect(response.body).to.have.property('address');
      expect(response.body).to.have.property('privateKey')
    });
  })

  describe('When the property password is not valid', () => {
    let response;
    before(async () => {
      response = await chai.request(server)
        .post('/address')
        .send({
          password: "teste"
        })
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

    it('Property "message" have the value: \"password\" length must be at least 6 characters long', () => {
      expect(response.body.message).to.be.equals("\"password\" length must be at least 6 characters long");
    });
  })

  describe('When the property password is not a String Type', () => {
    let response;
    before(async () => {
      response = await chai.request(server)
        .post('/address')
        .send({
          password: 123456
        })
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

    it('Property "message" have the value: \"password\" must be a string', () => {
      expect(response.body.message).to.be.equals("\"password\" must be a string");
    });
  })

  describe('When the property password is not filled', () => {
    let response;
    before(async () => {
      response = await chai.request(server)
        .post('/address')
        .send({})
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

    it('Property "message" have the value: \"password\" is required', () => {
      expect(response.body.message).to.be.equals("\"password\" is required");
    });
  })
})