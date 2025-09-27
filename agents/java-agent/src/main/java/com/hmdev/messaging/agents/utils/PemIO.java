package com.hmdev.messaging.agents.utils;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.security.Key;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.Security;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;

import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.util.io.pem.PemObject;
import org.bouncycastle.util.io.pem.PemReader;
import org.bouncycastle.util.io.pem.PemWriter;

public class PemIO {	
	
	static{
		Security.addProvider(new BouncyCastleProvider());
	}
	
	private PemIO(){
		super();
	}
	
	public static PrivateKey readPrivateKey(InputStream in) throws InvalidKeySpecException, FileNotFoundException, IOException, NoSuchAlgorithmException, NoSuchProviderException {
		
		PemReader pemReader = new PemReader(new InputStreamReader(in));	
		PemObject pemObj = pemReader.readPemObject();
		pemReader.close();
		
		KeyFactory factory = KeyFactory.getInstance("RSA", "BC");
		byte[] content = pemObj.getContent();
		PKCS8EncodedKeySpec privKeySpec = new PKCS8EncodedKeySpec(content);
		return factory.generatePrivate(privKeySpec);
	}	
	
	public static PublicKey readPublicKey(InputStream in) throws InvalidKeySpecException, FileNotFoundException, IOException, NoSuchAlgorithmException, NoSuchProviderException {
		
		PemReader pemReader = new PemReader(new InputStreamReader(in));		
		PemObject pemObj = pemReader.readPemObject();
		pemReader.close();
		
		KeyFactory factory = KeyFactory.getInstance("RSA", "BC");
		byte[] content = pemObj.getContent();
		X509EncodedKeySpec pubKeySpec = new X509EncodedKeySpec(content);
		return factory.generatePublic(pubKeySpec);
	}	
	
	public static void writePublicKey(PublicKey publicKey) throws FileNotFoundException, IOException{
		writePemFile(publicKey, "RSA PUBLIC KEY", "id_rsa.pub");
	}
	
	public static void writePrivateKey(PrivateKey privateKey) throws FileNotFoundException, IOException{
		writePemFile(privateKey, "RSA PRIVATE KEY", "id_rsa");
	}
	
	public static PublicKey generatePublicKey(KeyFactory factory,  PemObject pemObj) throws InvalidKeySpecException, FileNotFoundException, IOException {
		byte[] content = pemObj.getContent();
		X509EncodedKeySpec pubKeySpec = new X509EncodedKeySpec(content);
		return factory.generatePublic(pubKeySpec);
	}
	
	public static KeyPair generateRSAKeyPair() throws NoSuchAlgorithmException, NoSuchProviderException {
		KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA", "BC");
		generator.initialize(1024);
		
		KeyPair keyPair = generator.generateKeyPair();
		return keyPair;
	}
	
	private static void writePemFile(Key key, String description, String filename)
			throws FileNotFoundException, IOException {
		
		PemObject pemObject = new PemObject(description, key.getEncoded());
		PemWriter pemWriter = new PemWriter(new OutputStreamWriter(new FileOutputStream(filename)));
		try {
			pemWriter.writeObject(pemObject);
		} finally {
			pemWriter.close();
		}

	}
}