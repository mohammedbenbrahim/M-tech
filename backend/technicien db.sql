CREATE DATABASE DB_MTechnicien
GO 
USE DB_MTechnicien
GO
CREATE TABLE [Sites] (
	[id] BIGINT PRIMARY KEY IDENTITY(1,1) NOT NULL,
	[name] VARCHAR(255) UNIQUE NOT NULL
)
GO
CREATE TABLE [MotifsPause] (
	[id] BIGINT PRIMARY KEY IDENTITY(1,1) NOT NULL,
	[name] VARCHAR(255) UNIQUE NOT NULL
)
GO
CREATE TABLE [OperationStatus] (
	[id] BIGINT PRIMARY KEY IDENTITY(1,1) NOT NULL,
	[name] VARCHAR(255) UNIQUE NOT NULL
)
GO
CREATE TABLE [Roles] (
	[id] BIGINT PRIMARY KEY IDENTITY(1,1) NOT NULL,
	[name] VARCHAR(255) UNIQUE NOT NULL
)
GO
CREATE TABLE [Users] (
	[id] BIGINT PRIMARY KEY IDENTITY(1,1) NOT NULL,
	[userName] VARCHAR(255) UNIQUE NOT NULL,
	[firstName] VARCHAR(255) NOT NULL,
	[lastName] VARCHAR(255) NOT NULL,
	[email] VARCHAR(255) UNIQUE NOT NULL,
	[phone] VARCHAR(20) UNIQUE NOT NULL,
	[site] BIGINT FOREIGN KEY REFERENCES [Sites]([id]) NOT NULL,
	[password] VARCHAR(255) NOT NULL
)
GO
CREATE TABLE [UsersRoles] (
	[id] BIGINT PRIMARY KEY IDENTITY(1,1) NOT NULL,
	[user] BIGINT FOREIGN KEY REFERENCES [Users]([id]) NOT NULL,
	[role] BIGINT FOREIGN KEY REFERENCES [Roles]([id]) NOT NULL
)
GO
CREATE TABLE [Clients] (
	[id] BIGINT PRIMARY KEY IDENTITY(1,1) NOT NULL,
	[firstName] VARCHAR(255) NOT NULL,
	[lastName] VARCHAR(255) NOT NULL,
	[email] VARCHAR(255) UNIQUE NOT NULL,
	[phone] VARCHAR(20) UNIQUE NOT NULL,
)
GO
CREATE TABLE [OrdresReparation] (
	[id] BIGINT PRIMARY KEY IDENTITY(1,1) NOT NULL,
	[client] BIGINT FOREIGN KEY REFERENCES [Clients]([id]) NOT NULL,
	[site] BIGINT FOREIGN KEY REFERENCES [Sites]([id]) NOT NULL,
	[marque] VARCHAR(255) NOT NULL,
	[modele] VARCHAR(255) NOT NULL,
	[version] VARCHAR(255) NOT NULL,
	[carburant] VARCHAR(30) NOT NULL,
	[vin] VARCHAR(255) NOT NULL,
	[matricule] VARCHAR(255) NOT NULL,
	[kilometrage] BIGINT NOT NULL,
	[dateOpen] DATETIME NOT NULL DEFAULT GETDATE(),
	[dateClose] DATETIME NOT NULL
)
GO
CREATE TABLE [Operations] (
	[id] BIGINT PRIMARY KEY IDENTITY(1,1) NOT NULL,
	[or] BIGINT FOREIGN KEY REFERENCES [OrdresReparation]([id]) NOT NULL,
	[technicien] BIGINT FOREIGN KEY REFERENCES [Users]([id]) NOT NULL,
	[status] BIGINT FOREIGN KEY REFERENCES [OperationStatus]([id]) NOT NULL,
	[description] VARCHAR(255) NULL,
	[dateStart] DATETIME NULL,
	[dateEnd] DATETIME NULL,
	[dateAffectation] DATETIME NULL,
	[commentAffectation] VARCHAR(255) NULL,
	[motifPause] BIGINT FOREIGN KEY REFERENCES [MotifsPause]([id]) NULL,
	[commentfPause] VARCHAR(255) NULL,
	[cronCalcStart] BIGINT NULL DEFAULT 0,
	[cronCalcStop] BIGINT NULL DEFAULT 0,
	[cronCalcTotal] BIGINT NULL DEFAULT 0,
	[cronEventStart] DATETIME NULL,
	[cronEventStop] DATETIME NULL
)
GO
CREATE TABLE [Logs] (
    [id] BIGINT IDENTITY(1,1) PRIMARY KEY,
    [level] NVARCHAR(50) NOT NULL,
    [message] NVARCHAR(MAX) NOT NULL,
    [method] NVARCHAR(50),
    [endpoint] NVARCHAR(255),
    [ipAddress] NVARCHAR(50),
    [user] BIGINT,
    [timestamp] DATETIME DEFAULT GETDATE()
);
GO
--Views
--Users View
CREATE OR ALTER VIEW [V_Users] AS
SELECT 
    u.id,
    u.userName,
	u.lastName + ' ' + u.firstName AS fullName,
    u.firstName,
    u.lastName,
    u.email,
    u.phone,
    u.site as idSite,
	st.name as nameSite,
    u.password,
    (
        SELECT r.id, r.name 
        FROM UsersRoles ur
        JOIN Roles r ON ur.role = r.id
        WHERE ur.[user] = u.id
        FOR JSON PATH
    ) AS roles
FROM Users u
LEFT JOIN Sites st
ON u.site = st.id;
GO
-- views
CREATE OR ALTER view V_operation AS
SELECT 
    op.[id]
    ,[description] AS [title]
    ,st.name AS [status]
    ,[dateStart] AS [startDate]
    ,[dateEnd] AS [endDate]
    ,CASE 
		WHEN [status] = 2 
			THEN 
				CASE 
					WHEN [cronEventStart] is not null 
						THEN CAST((DATEDIFF(MILLISECOND, [cronEventStart], GETDATE()) / 1000) AS BIGINT) 
				ELSE 0 
				END 
		ELSE [cronCalcStart] /1000
	END AS [passeTime]
	,CASE 
		WHEN [status] = 3 
			THEN 
				CASE 
					WHEN [cronEventStop] is not null 
						THEN CAST((DATEDIFF(MILLISECOND, [cronEventStop], GETDATE()) / 1000) AS BIGINT) 
				ELSE 0 
				END 
		ELSE [cronCalcStop] / 1000
	END AS [pauseTime]
    ,[commentAffectation] AS [affectedComment]
    ,[motifPause]
    ,[commentfPause] AS [motifPauseComment]
FROM [DB_MTechnicien].[dbo].[Operations] AS op
LEFT JOIN [DB_MTechnicien].[dbo].[OperationStatus] AS st
on op.status = st.id
LEFT JOIN [DB_MTechnicien].[dbo].[MotifsPause] AS mot
on op.motifPause = mot.id


-- Create Triggers
-- Trigger calcul total
CREATE TRIGGER trg_Operations_CalculateTotal
ON [Operations]
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE [Operations]
    SET [cronCalcTotal] = ISNULL(i.[cronCalcStop], 0) + ISNULL(i.[cronCalcStart], 0)
    FROM [Operations] o
    INNER JOIN inserted i ON o.[id] = i.[id];
END;
-- Create Triggers
-- Trigger proc start
CREATE OR ALTER PROCEDURE start_operation
    @operationId BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if the operation exists and has status = 2
    IF NOT EXISTS (
        SELECT 1 FROM [Operations] WHERE id = @operationId AND status in (1,3)
    )
    BEGIN
        -- Return an error message if the status is not 2
        THROW 50000, 'L''opération ne peut pas être commencée.', 1;
        RETURN;
    END

    -- Update the operation if the status is 2
    UPDATE [Operations]
    SET 
		status = 2,
		dateStart = CASE 
                WHEN dateStart IS NULL 
                THEN GETDATE()
                ELSE dateStart
            END,
        cronEventStart = GETDATE(),
        cronCalcStop = cronCalcStop + 
            CASE 
                WHEN cronEventStop IS NOT NULL 
                THEN DATEDIFF(MILLISECOND, cronEventStop, GETDATE()) 
                ELSE 0 
            END
    WHERE id = @operationId;
END
GO

-- Trigegr proc stop
CREATE OR ALTER PROCEDURE stop_operation
    @operationId BIGINT,
	@motif VARCHAR(max),
	@comment VARCHAR(max)
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if the operation exists and has status = 2
    IF NOT EXISTS (
        SELECT 1 FROM [Operations] WHERE id = @operationId AND status = 2
    )
    BEGIN
        -- Return an error message if the status is not 2
        THROW 50000, 'L''opération ne peut pas être arrêtée.', 1;
        RETURN;
    END

	-- Check if @motif is NULL or empty and return an error if so
    IF @motif IS NULL OR LTRIM(RTRIM(@motif)) = ''
    BEGIN
        THROW 50001, 'Le motif est obligatoire.', 1;
        RETURN;
    END

    -- Update the operation if the status is 2
    UPDATE [Operations]
    SET 
        status = 3,
		motifPause = @motif,
		commentfPause = @comment,
        cronEventStop = GETDATE(),
        cronCalcStart = cronCalcStart + 
            CASE 
                WHEN cronEventStart IS NOT NULL 
                THEN DATEDIFF(MILLISECOND, cronEventStart, GETDATE()) 
                ELSE 0 
            END
    WHERE id = @operationId;
END
GO

-- Trigegr proc end
CREATE OR ALTER PROCEDURE end_operation
    @operationId BIGINT
AS
BEGIN
    SET NOCOUNT ON;

    -- Check if the operation exists and has status = 2
    IF NOT EXISTS (
        SELECT 1 FROM [Operations] WHERE id = @operationId AND status NOT IN (2,3)
    )
    BEGIN
        -- Return an error message if the status is not 2
        THROW 50000, 'L''opération ne peut pas être términée.', 1;
        RETURN;
    END


	if exists (SELECT 1 FROM [Operations] WHERE id = @operationId and status = 2)--inprogress
	BEGIN
    UPDATE [Operations]
    SET 
        status = 4,
		dateEnd = GETDATE(),
        cronEventStop = GETDATE(),
        cronCalcStart = cronCalcStart + 
            CASE 
                WHEN cronEventStart IS NOT NULL 
                THEN DATEDIFF(MILLISECOND, cronEventStart, GETDATE()) 
                ELSE 0 
            END
    WHERE id = @operationId;
	END
	ELSE IF exists (SELECT 1 FROM [Operations] WHERE id = @operationId and status = 3)--pause
	BEGIN
		UPDATE [Operations]
		SET 
			status = 4,
			dateEnd = GETDATE(),
			cronEventStart = GETDATE(),
			cronCalcStop = cronCalcStop + 
				CASE 
					WHEN cronEventStop IS NOT NULL 
					THEN DATEDIFF(MILLISECOND, cronEventStop, GETDATE()) 
					ELSE 0 
				END
		WHERE id = @operationId;
	END
END
GO



SELECT * FROM [DB_MTechnicien].[dbo].[Clients]
SELECT * FROM [DB_MTechnicien].[dbo].[MotifsPause]
SELECT * FROM [DB_MTechnicien].[dbo].[OperationStatus]
SELECT * FROM [DB_MTechnicien].[dbo].[Roles]
SELECT * FROM [DB_MTechnicien].[dbo].[Sites]
SELECT * FROM [DB_MTechnicien].[dbo].[Users]
SELECT * FROM [DB_MTechnicien].[dbo].[UsersRoles]
SELECT * FROM [DB_MTechnicien].[dbo].[OrdresReparation]
SELECT * FROM [DB_MTechnicien].[dbo].[Operations]

--INSERT INTO [dbo].[OrdresReparation]
--           ([client]
--           ,[site]
--           ,[marque]
--           ,[modele]
--           ,[version]
--           ,[carburant]
--           ,[vin]
--           ,[matricule]
--           ,[kilometrage]
--           ,[dateOpen]
--           ,[dateClose])
--     VALUES
--           (1,1,'Fiat','Tipo','Sedan BVA','Diesel','4Y1SL65848Z411439','25456-A-72',50000,GETDATE(),GETDATE())
--GO

--INSERT INTO [dbo].[Operations]
--           ([or]
--           ,[technicien]
--           ,[status]
--           ,[description]
--           --,[dateStart]
--           --,[dateEnd]
--           ,[dateAffectation]
--           ,[commentAffectation]
--           --,[motifPause]
--           --,[commentfPause]
--           --,[cronCalcStart]
--           --,[cronCalcStop]
--           --,[cronCalcTotal]
--           --,[cronEventStart]
--           --,[cronEventStop]
--		   )
--     VALUES
--           (2,1,1,'prob turbo',GETDATE(),'Affected to this tech bcz is expert')
--GO