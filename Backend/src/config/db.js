import mongoose from 'mongoose';
import dns from 'dns';

// Fix for Node.js / ISP DNS SRV resolution issues on Windows (e.g. Jio/Airtel/Wi-Fi ENOTFOUND)
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignore if custom DNS cannot be set
}

const LOCAL_FALLBACK_URI = 'mongodb://127.0.0.1:27017/tradejournal';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || LOCAL_FALLBACK_URI;

  try {
    if (uri.includes('<db_username>') || uri.includes('<db_password>')) {
      console.warn(
        '\n⚠️  [MongoDB Warning] MONGODB_URI contains unconfigured placeholder credentials (<db_username>:<db_password>).'
      );
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ [MongoDB Connected] Host: ${conn.connection.host}, DB: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`⚠️  [Primary MongoDB Connection Failed]: ${error.message}`);

    // If primary was Atlas and failed, try local fallback automatically
    if (uri !== LOCAL_FALLBACK_URI) {
      console.log('🔄 Attempting connection to local MongoDB fallback (mongodb://127.0.0.1:27017/tradejournal)...');
      try {
        const localConn = await mongoose.connect(LOCAL_FALLBACK_URI, {
          serverSelectionTimeoutMS: 3000,
        });
        console.log(`✅ [Local MongoDB Connected Fallback] Host: ${localConn.connection.host}, DB: ${localConn.connection.name}`);
        console.log('💡 Note: You are connected to local MongoDB because MongoDB Atlas connection failed.');
        console.log('   To connect to MongoDB Atlas, whitelist your IP address in MongoDB Atlas > Network Access (0.0.0.0/0).');
        return localConn;
      } catch (localErr) {
        console.error(`❌ [Local MongoDB Also Unavailable]: ${localErr.message}`);
      }
    }
  }
};

