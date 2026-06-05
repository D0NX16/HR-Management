const pool = require('./db');

async function seedData() {
    let connection;
    try {
        connection = await pool.getConnection();
        
        // Create table if not exists
        const createTableSql = `
            CREATE TABLE IF NOT EXISTS interview_tracker (
                id INT AUTO_INCREMENT PRIMARY KEY,
                candidate_name VARCHAR(255) NOT NULL,
                position VARCHAR(255) NOT NULL,
                experience INT NOT NULL,
                applied_date DATE NOT NULL,
                round VARCHAR(255) NOT NULL,
                interview_date DATE NOT NULL,
                interviewer VARCHAR(255) NOT NULL,
                status VARCHAR(50) NOT NULL
            );
        `;
        await connection.query(createTableSql);
        
        // Insert 5 sample records
        const sampleData = [
            ['John Doe', 'Frontend Developer', 3, '2026-06-01', 'Technical', '2026-06-05', 'Jane Smith', 'Selected'],
            ['Alice Johnson', 'Backend Engineer', 5, '2026-05-28', 'HR', '2026-06-02', 'Mike Brown', 'In Progress'],
            ['Bob Williams', 'UX Designer', 2, '2026-06-03', 'Initial Screening', '2026-06-06', 'Sarah Connor', 'Pending'],
            ['Emily Davis', 'Project Manager', 8, '2026-05-20', 'Final', '2026-05-25', 'Tom Hardy', 'Rejected'],
            ['Michael Wilson', 'Data Analyst', 4, '2026-06-04', 'Technical Task', '2026-06-08', 'Lisa Ray', 'Pending']
        ];
        
        const insertSql = `INSERT INTO interview_tracker (candidate_name, position, experience, applied_date, round, interview_date, interviewer, status) VALUES ?`;
        
        await connection.query(insertSql, [sampleData]);
        
        console.log("Successfully inserted 5 sample records into interview_tracker.");
        
    } catch (err) {
        console.error("Error seeding data:", err);
    } finally {
        if (connection) connection.release();
        process.exit();
    }
}

seedData();
