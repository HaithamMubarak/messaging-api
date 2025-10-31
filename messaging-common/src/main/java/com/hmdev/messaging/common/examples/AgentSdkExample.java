package com.hmdev.messaging.common.examples;

import com.hmdev.messaging.common.crypto.EnvelopeUtil;

import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.util.Base64;

/**
 * Small runnable example that demonstrates the RSA-based REQUEST_PASSWORD -> PASSWORD_REPLY -> connect flow.
 * This runs entirely in-process and uses EnvelopeUtil.rsaEncrypt/rsaDecrypt to protect the password.
 */
public class AgentSdkExample {
    public static void main(String[] args) throws Exception {
        // Identities
        String initiatorName = "InitiatorAgent";
        String requesterName = "NewAgent";
        String channelId = "channel:123";

        // Initiator creates channel password (keeps it private)
        String channelPassword = "s3cr3t-pass-" + System.currentTimeMillis();
        System.out.println("[Initiator] created channel password: " + channelPassword);

        // Requester generates an RSA keypair and sends a REQUEST_PASSWORD message including its public key
        KeyPair requesterKeyPair = EnvelopeUtil.generateRSAKeyPair();
        String requesterPubB64 = EnvelopeUtil.encodeRSAPublicKey(requesterKeyPair.getPublic());

        String requestJson = "{\"type\":\"REQUEST_PASSWORD\",\"sender\":\"" + requesterName + "\",\"content\":\"" + requesterPubB64 + "\"}";
        System.out.println("[Requester] sending REQUEST_PASSWORD: " + requestJson);

        // --- Initiator receives request and prepares PASSWORD_REPLY ---
        // In this example we already have requesterPubB64
        String extractedPubB64 = requesterPubB64; // in real code parse JSON
        PublicKey requesterPub = EnvelopeUtil.decodeRSAPublicKey(extractedPubB64);

        // Initiator encrypts the channel password to the requester's RSA public key
        byte[] ciphertext = EnvelopeUtil.rsaEncrypt(requesterPub, channelPassword.getBytes(StandardCharsets.UTF_8));
        String cipherB64 = Base64.getEncoder().encodeToString(ciphertext);

        // PASSWORD_REPLY wrapper (opaque ciphertext)
        String passwordReply = "{\"type\":\"PASSWORD_REPLY\",\"sender\":\"" + initiatorName + "\",\"recipient\":\"" + requesterName + "\",\"content\":\"" + cipherB64 + "\"}";
        System.out.println("[Initiator] sent PASSWORD_REPLY (ciphertext base64): " + passwordReply);

        // --- Requester receives PASSWORD_REPLY and unwraps ciphertext ---
        // Extract ciphertext base64 (example uses the string above)
        String encodedCipher = cipherB64;
        byte[] cipherBytes = Base64.getDecoder().decode(encodedCipher);

        byte[] recovered = EnvelopeUtil.rsaDecrypt(requesterKeyPair.getPrivate(), cipherBytes);
        String recoveredPassword = new String(recovered, StandardCharsets.UTF_8);
        System.out.println("[Requester] decrypted password: " + recoveredPassword);

        // Connect using recovered password
        if (channelPassword.equals(recoveredPassword)) {
            System.out.println("[Requester] password matches, connecting to channel " + channelId + " as agent " + requesterName);
        } else {
            System.out.println("[Requester] password mismatch! Aborting");
        }
    }
}
