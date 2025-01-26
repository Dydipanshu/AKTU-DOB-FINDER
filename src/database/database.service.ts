import { MongoClient, Db } from 'mongodb';
import { MONGO_DB_URI } from '../config';
import { Student } from '../interfaces';

let database: Db | null = null;
export const client = new MongoClient(MONGO_DB_URI); 

export class DatabaseService {
  static async connectToDatabase(): Promise<Db> {
    if (!database) {
      try {
        await client.connect();
        database = client.db(process.env.DATABASE_NAME);
      } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
      }
    }
    return database;
  }
  static async findInDatabase(rollNumber: string): Promise<Student | null> {
    const db = await DatabaseService.connectToDatabase();
    const collection = db.collection<Student>('students'); 
    return collection.findOne({ applicationNumber: rollNumber });
  }

  static async saveToDatabase(data: Student): Promise<void> {
    const db = await DatabaseService.connectToDatabase();
    const collection = db.collection<Student>('students'); 
    await collection.insertOne(data);
  }
}