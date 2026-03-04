import app from './app';
import createTables from './config/migrate';

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await createTables();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
