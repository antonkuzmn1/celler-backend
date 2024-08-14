# Headers

```
Authorization: 'Bearer token'
```

# Endpoints

### Security

- #### Get token by credentials
  POST /api/security
  ```
  {
  username: string,
  password: string
  }
  ```

- #### Get User's ID from the token
  GET /api/security

### User

- #### Get all users
  GET /api/security/user

- #### Create new user
  POST /api/security/user
  ```
  {
  username: string,
  password: string,
  admin: boolean,
  name: string,
  title: string
  }
  ```

- #### Update user
  PUT /api/security/user
  ```
  {
  id: integer
  username: string,
  password: string,
  admin: boolean,
  name: string,
  title: string
  }
  ```

- #### Soft delete user
  DELETE /api/security/user
  ```
  {
  id: integer
  }
  ```

- #### Add group for user
  POST /api/security/user/group
  ```
  {
  userId: integer,
  groupId: integer
  }
  ```

- #### Remove group for user
  DELETE /api/security/user/group
  ```
  {
  userId: integer,
  groupId: integer
  }
  ```

### Group

- #### Get all groups
  GET /api/security/group

- #### Create new group
  POST /api/security/group
  ```
  {
  name: string,
  title: string
  }
  ```

- #### Update group
  PUT /api/security/group
  ```
  {
  id: integer
  name: string,
  title: string
  }
  ```

- #### Soft delete group
  DELETE /api/security/group
  ```
  {
  id: integer
  }
  ```

- #### Add user in the group
  POST /api/security/group/user
  ```
  {
  userId: integer,
  groupId: integer
  }
  ```

- #### Remove user from group
  DELETE /api/security/group/user
  ```
  {
  userId: integer,
  groupId: integer
  }
  ```

### Table

- #### Get tables
  GET /api/table

- #### Create new table
  POST /api/table
  ```
  {
  name: string,
  title: string
  }
  ```

- #### Update table
  PUT /api/table
  ```
  {
  id: integer
  name: string,
  title: string
  }
  ```

- #### Soft delete table
  DELETE /api/table
  ```
  {
  id: integer
  }
  ```

- #### Add table in the group
  POST /api/table/group
  ```
  {
  tableId: integer,
  groupId: integer
  }
  ```

- #### Remove table from the group
  DELETE /api/table/group
  ```
  {
  tableId: integer,
  groupId: integer
  }
  ```

- #### Add table in the groupCreate
  POST /api/table/groupCreate
  ```
  {
  tableId: integer,
  groupId: integer
  }
  ```

- #### Remove table from the groupCreate
  DELETE /api/table/groupCreate
  ```
  {
  tableId: integer,
  groupId: integer
  }
  ```

- #### Add table in the groupDelete
  POST /api/table/groupDelete
  ```
  {
  tableId: integer,
  groupId: integer
  }
  ```

- #### Remove table from the groupDelete
  DELETE /api/table/groupDelete
  ```
  {
  tableId: integer,
  groupId: integer
  }
  ```
  
### Column

- #### Get all columns
  GET /api/table/column
  ```
  {
  tableId: integer,
  }
  ```

- #### Create new column
  POST /api/table/column
  ```
  {
  name: string,
  title: string,
  type: string,
  dropdown: JSON,
  order: integer
  }
  ```

- #### Update column
  PUT /api/table/column
  ```
  {
  id: integer
  name: string,
  title: string,
  type: string,
  dropdown: JSON,
  order: integer
  }
  ```

- #### Soft delete column
  DELETE /api/table/column
  ```
  {
  id: integer
  }
  ```

- #### Add group for column
  POST /api/table/column/group
  ```
  {
  columnId: integer,
  groupId: integer
  }
  ```

- #### Remove group for column
  DELETE /api/table/column/group
  ```
  {
  columnId: integer,
  groupId: integer
  }
  ```

### Row

- #### Get all rows
  GET /api/table/column
  ```
  {
  tableId: integer,
  }
  ```

- #### Create new row
  POST /api/table/column
  ```
  {
  tableId: integer,
  }
  ```

- #### Soft delete user
  DELETE /api/table/column
  ```
  {
  id: integer
  }
  ```

### Cell

- #### Update cell
  PUT /api/table/cell
  ```
  {
  id: integer
  valueInt: integer,
  valueString: string,
  valueDate: Date,
  valueBoolean: boolean,
  valueDropdown: JSON
  }
  ```

### Log

- #### Get all logs
  GET /api/log
