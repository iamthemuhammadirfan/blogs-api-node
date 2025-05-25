const { User } = require("../../src/models");
const { sampleUsers, invalidUserData } = require("../fixtures/testData");

describe("User Model", () => {
  describe("Schema Validation", () => {
    it("should create a valid user with all required fields", async () => {
      const userData = sampleUsers[0];
      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.first_name).toBe(userData.first_name);
      expect(savedUser.last_name).toBe(userData.last_name);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.bio).toBe(userData.bio);
      expect(savedUser.created_date).toBeDefined();
      expect(savedUser.modified_date).toBeDefined();
    });

    it("should require first_name field", async () => {
      const user = new User(invalidUserData[0]);

      await expect(user.save()).rejects.toThrow(
        /Path `first_name` is required/
      );
    });

    it("should require email field", async () => {
      const user = new User({
        first_name: "Valid",
        last_name: "Name",
        bio: "Valid bio",
      });

      await expect(user.save()).rejects.toThrow(/Path `email` is required/);
    });

    it("should validate email format", async () => {
      const user = new User(invalidUserData[1]);

      await expect(user.save()).rejects.toThrow(/Please provide a valid email/);
    });

    it("should enforce unique email constraint", async () => {
      const userData = sampleUsers[0];

      // Create first user
      const user1 = new User(userData);
      await user1.save();

      // Try to create second user with same email
      const user2 = new User(userData);

      await expect(user2.save()).rejects.toThrow(/duplicate key error/);
    });

    it("should have optional bio field", async () => {
      const userData = {
        first_name: "Test",
        last_name: "User",
        email: "test@example.com",
        // bio is optional
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.bio).toBeUndefined();
    });
  });

  describe("Instance Methods", () => {
    it("should return JSON without sensitive fields", async () => {
      const userData = sampleUsers[0];
      const user = new User(userData);
      const savedUser = await user.save();

      const userJson = savedUser.toJSON();

      expect(userJson._id).toBeDefined();
      expect(userJson.first_name).toBe(userData.first_name);
      expect(userJson.last_name).toBe(userData.last_name);
      expect(userJson.email).toBe(userData.email);
      expect(userJson.__v).toBeUndefined(); // Should be removed by transform
    });
  });

  describe("Static Methods", () => {
    beforeEach(async () => {
      // Create test users
      await User.create(sampleUsers);
    });

    it("should find user by email", async () => {
      const user = await User.findOne({ email: "john.doe@example.com" });

      expect(user).toBeTruthy();
      expect(user.first_name).toBe("John");
      expect(user.last_name).toBe("Doe");
      expect(user.email).toBe("john.doe@example.com");
    });

    it("should find users by name", async () => {
      const user = await User.findOne({ first_name: "Jane" });

      expect(user).toBeTruthy();
      expect(user.first_name).toBe("Jane");
      expect(user.last_name).toBe("Smith");
    });

    it("should return null for non-existent user", async () => {
      const user = await User.findOne({ email: "non-existent@example.com" });

      expect(user).toBeNull();
    });
  });
});
