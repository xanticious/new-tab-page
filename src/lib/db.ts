import {
  Picture,
  Tag,
  Url,
  Theme,
  Category,
  Profile,
  UrlClickEvent,
  CreatePicture,
  CreateTag,
  CreateUrl,
  CreateTheme,
  CreateCategory,
  CreateProfile,
  UpdatePicture,
  UpdateTag,
  UpdateUrl,
  UpdateTheme,
  UpdateCategory,
  UpdateProfile,
  ThemeData,
  ID,
} from "@/types";
import { preloadedData } from "@/data/preloaded";

// Database configuration
const DB_NAME = "NewTabPageDB";
const DB_VERSION = 1;
const STORES = {
  PICTURES: "pictures",
  TAGS: "tags",
  URLS: "urls",
  THEMES: "themes",
  CATEGORIES: "categories",
  PROFILES: "profiles",
  URL_CLICK_EVENTS: "urlClickEvents",
  METADATA: "metadata",
} as const;

// Metadata keys
const METADATA_KEYS = {
  PRELOADED_DATA_LOADED: "preloaded_data_loaded",
} as const;

class DatabaseAPI {
  private db: IDBDatabase | null = null;

  /**
   * Initialize the database and load preloaded data if needed
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.loadPreloadedDataIfNeeded().then(resolve).catch(reject);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains(STORES.PICTURES)) {
          db.createObjectStore(STORES.PICTURES, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORES.TAGS)) {
          db.createObjectStore(STORES.TAGS, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORES.URLS)) {
          db.createObjectStore(STORES.URLS, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORES.THEMES)) {
          db.createObjectStore(STORES.THEMES, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORES.CATEGORIES)) {
          db.createObjectStore(STORES.CATEGORIES, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORES.PROFILES)) {
          db.createObjectStore(STORES.PROFILES, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORES.URL_CLICK_EVENTS)) {
          const clickEventStore = db.createObjectStore(
            STORES.URL_CLICK_EVENTS,
            {
              keyPath: "id",
              autoIncrement: true,
            }
          );
          // Create indexes for efficient querying
          clickEventStore.createIndex("urlId", "urlId", { unique: false });
          clickEventStore.createIndex("timestamp", "timestamp", {
            unique: false,
          });
          clickEventStore.createIndex("hour", "hour", { unique: false });
          clickEventStore.createIndex("weekday", "weekday", { unique: false });
        }
        if (!db.objectStoreNames.contains(STORES.METADATA)) {
          db.createObjectStore(STORES.METADATA, { keyPath: "key" });
        }
      };
    });
  }

  /**
   * Load preloaded data if it hasn't been loaded yet
   */
  private async loadPreloadedDataIfNeeded(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    const isLoaded = await this.getMetadata(
      METADATA_KEYS.PRELOADED_DATA_LOADED
    );
    if (isLoaded) return;

    const transaction = this.db.transaction(Object.values(STORES), "readwrite");

    // Load all preloaded data
    await Promise.all([
      this.bulkAdd(
        transaction.objectStore(STORES.PICTURES),
        preloadedData.pictures
      ),
      this.bulkAdd(transaction.objectStore(STORES.TAGS), preloadedData.tags),
      this.bulkAdd(transaction.objectStore(STORES.URLS), preloadedData.urls),
      this.bulkAdd(
        transaction.objectStore(STORES.THEMES),
        preloadedData.themes
      ),
      this.bulkAdd(
        transaction.objectStore(STORES.CATEGORIES),
        preloadedData.categories
      ),
      this.bulkAdd(
        transaction.objectStore(STORES.PROFILES),
        preloadedData.profiles
      ),
    ]);

    // Mark as loaded
    await this.setMetadata(METADATA_KEYS.PRELOADED_DATA_LOADED, true);
  }

  /**
   * Helper to bulk add items to a store
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async bulkAdd(store: IDBObjectStore, items: any[]): Promise<void> {
    return Promise.all(
      items.map(
        (item) =>
          new Promise<void>((resolve, reject) => {
            const request = store.add(item);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          })
      )
    ).then(() => {});
  }

  /**
   * Generic CRUD operations
   */
  private async getItem<T>(storeName: string, id: ID): Promise<T | null> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  private async getAllItems<T>(storeName: string): Promise<T[]> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  private async addItem<T extends { id: ID; readonly: boolean }>(
    storeName: string,
    item: T
  ): Promise<T> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.add(item);

      request.onsuccess = () => resolve(item);
      request.onerror = () => reject(request.error);
    });
  }

  private async updateItem<T extends { id: ID; readonly?: boolean }>(
    storeName: string,
    item: T
  ): Promise<T> {
    if (!this.db) throw new Error("Database not initialized");

    // Check if item exists and is readonly
    const existing = await this.getItem<{ readonly: boolean }>(
      storeName,
      item.id
    );
    if (existing?.readonly) {
      throw new Error("Cannot update readonly item");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => resolve(item);
      request.onerror = () => reject(request.error);
    });
  }

  private async deleteItem(storeName: string, id: ID): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    // Check if item exists and is readonly
    const existing = await this.getItem<{ readonly: boolean }>(storeName, id);
    if (existing?.readonly) {
      throw new Error("Cannot delete readonly item");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Metadata operations
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async getMetadata(key: string): Promise<any> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.METADATA], "readonly");
      const store = transaction.objectStore(STORES.METADATA);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result?.value || null);
      request.onerror = () => reject(request.error);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async setMetadata(key: string, value: any): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.METADATA], "readwrite");
      const store = transaction.objectStore(STORES.METADATA);
      const request = store.put({ key, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Picture CRUD operations
   */
  async getPicture(id: ID): Promise<Picture | null> {
    return this.getItem<Picture>(STORES.PICTURES, id);
  }

  async getAllPictures(): Promise<Picture[]> {
    return this.getAllItems<Picture>(STORES.PICTURES);
  }

  async createPicture(data: CreatePicture): Promise<Picture> {
    const picture: Picture = {
      ...data,
      id: crypto.randomUUID(),
      readonly: false,
    };
    return this.addItem(STORES.PICTURES, picture);
  }

  async updatePicture(data: UpdatePicture): Promise<Picture> {
    const existing = await this.getPicture(data.id);
    if (!existing) throw new Error("Picture not found");

    const updated: Picture = { ...existing, ...data };
    return this.updateItem(STORES.PICTURES, updated);
  }

  async deletePicture(id: ID): Promise<void> {
    return this.deleteItem(STORES.PICTURES, id);
  }

  /**
   * Tag CRUD operations
   */
  async getTag(id: ID): Promise<Tag | null> {
    return this.getItem<Tag>(STORES.TAGS, id);
  }

  async getAllTags(): Promise<Tag[]> {
    return this.getAllItems<Tag>(STORES.TAGS);
  }

  async createTag(data: CreateTag): Promise<Tag> {
    const tag: Tag = {
      ...data,
      id: crypto.randomUUID(),
      readonly: false,
    };
    return this.addItem(STORES.TAGS, tag);
  }

  async updateTag(data: UpdateTag): Promise<Tag> {
    const existing = await this.getTag(data.id);
    if (!existing) throw new Error("Tag not found");

    const updated: Tag = { ...existing, ...data };
    return this.updateItem(STORES.TAGS, updated);
  }

  async deleteTag(id: ID): Promise<void> {
    return this.deleteItem(STORES.TAGS, id);
  }

  /**
   * URL CRUD operations
   */
  async getUrl(id: ID): Promise<Url | null> {
    return this.getItem<Url>(STORES.URLS, id);
  }

  async getAllUrls(): Promise<Url[]> {
    return this.getAllItems<Url>(STORES.URLS);
  }

  async createUrl(data: CreateUrl): Promise<Url> {
    const url: Url = {
      ...data,
      id: crypto.randomUUID(),
      readonly: false,
    };
    return this.addItem(STORES.URLS, url);
  }

  async updateUrl(data: UpdateUrl): Promise<Url> {
    const existing = await this.getUrl(data.id);
    if (!existing) throw new Error("URL not found");

    const updated: Url = { ...existing, ...data };
    return this.updateItem(STORES.URLS, updated);
  }

  async deleteUrl(id: ID): Promise<void> {
    return this.deleteItem(STORES.URLS, id);
  }

  /**
   * Theme CRUD operations
   */
  async getTheme(id: ID): Promise<Theme | null> {
    return this.getItem<Theme>(STORES.THEMES, id);
  }

  async getAllThemes(): Promise<Theme[]> {
    return this.getAllItems<Theme>(STORES.THEMES);
  }

  async createTheme(data: CreateTheme): Promise<Theme> {
    const theme: Theme = {
      ...data,
      id: crypto.randomUUID(),
      readonly: false,
    };
    return this.addItem(STORES.THEMES, theme);
  }

  async updateTheme(data: UpdateTheme): Promise<Theme> {
    const existing = await this.getTheme(data.id);
    if (!existing) throw new Error("Theme not found");

    const updated: Theme = { ...existing, ...data };
    return this.updateItem(STORES.THEMES, updated);
  }

  async deleteTheme(id: ID): Promise<void> {
    return this.deleteItem(STORES.THEMES, id);
  }

  /**
   * Category CRUD operations
   */
  async getCategory(id: ID): Promise<Category | null> {
    return this.getItem<Category>(STORES.CATEGORIES, id);
  }

  async getAllCategories(): Promise<Category[]> {
    return this.getAllItems<Category>(STORES.CATEGORIES);
  }

  async createCategory(data: CreateCategory): Promise<Category> {
    const category: Category = {
      ...data,
      id: crypto.randomUUID(),
      readonly: false,
    };
    return this.addItem(STORES.CATEGORIES, category);
  }

  async updateCategory(data: UpdateCategory): Promise<Category> {
    const existing = await this.getCategory(data.id);
    if (!existing) throw new Error("Category not found");

    const updated: Category = { ...existing, ...data };
    return this.updateItem(STORES.CATEGORIES, updated);
  }

  async deleteCategory(id: ID): Promise<void> {
    return this.deleteItem(STORES.CATEGORIES, id);
  }

  /**
   * Profile CRUD operations
   */
  async getProfile(id: ID): Promise<Profile | null> {
    return this.getItem<Profile>(STORES.PROFILES, id);
  }

  async getAllProfiles(): Promise<Profile[]> {
    return this.getAllItems<Profile>(STORES.PROFILES);
  }

  async createProfile(data: CreateProfile): Promise<Profile> {
    const profile: Profile = {
      ...data,
      id: crypto.randomUUID(),
      readonly: false,
    };
    return this.addItem(STORES.PROFILES, profile);
  }

  async updateProfile(data: UpdateProfile): Promise<Profile> {
    const existing = await this.getProfile(data.id);
    if (!existing) throw new Error("Profile not found");

    const updated: Profile = { ...existing, ...data };
    return this.updateItem(STORES.PROFILES, updated);
  }

  async deleteProfile(id: ID): Promise<void> {
    return this.deleteItem(STORES.PROFILES, id);
  }

  /**
   * Utility methods
   */
  async searchUrls(query: string): Promise<Url[]> {
    const urls = await this.getAllUrls();
    const lowercaseQuery = query.toLowerCase();

    return urls.filter(
      (url) =>
        url.name.toLowerCase().includes(lowercaseQuery) ||
        url.url.toLowerCase().includes(lowercaseQuery)
    );
  }

  async getUrlsByTag(tagId: ID): Promise<Url[]> {
    const urls = await this.getAllUrls();
    return urls.filter((url) => url.tags.includes(tagId));
  }

  async getUrlsByCategory(categoryId: ID): Promise<Url[]> {
    const category = await this.getCategory(categoryId);
    if (!category) return [];

    const urls = await Promise.all(
      category.urls.map((urlId) => this.getUrl(urlId))
    );

    return urls.filter((url): url is Url => url !== null);
  }

  /**
   * Bulk operations
   */
  async exportData(): Promise<{
    pictures: Picture[];
    tags: Tag[];
    urls: Url[];
    themes: Theme[];
    categories: Category[];
    profiles: Profile[];
  }> {
    const [pictures, tags, urls, themes, categories, profiles] =
      await Promise.all([
        this.getAllPictures(),
        this.getAllTags(),
        this.getAllUrls(),
        this.getAllThemes(),
        this.getAllCategories(),
        this.getAllProfiles(),
      ]);

    return { pictures, tags, urls, themes, categories, profiles };
  }

  async exportProfileData(profileId: ID): Promise<{
    pictures: Picture[];
    tags: Tag[];
    urls: Url[];
    themes: Theme[];
    categories: Category[];
    profiles: Profile[];
  }> {
    // Get the specific profile
    const profile = await this.getProfile(profileId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    // Get all categories for this profile
    const allCategories = await this.getAllCategories();
    const profileCategories = allCategories.filter((c) =>
      profile.categories.includes(c.id)
    );

    // Get all URLs from these categories
    const allUrls = await this.getAllUrls();
    const categoryUrlIds = profileCategories.flatMap((c) => c.urls);
    const profileUrls = allUrls.filter((u) => categoryUrlIds.includes(u.id));

    // Get all tags used by these URLs
    const allTags = await this.getAllTags();
    const usedTagIds = [...new Set(profileUrls.flatMap((u) => u.tags))];
    const profileTags = allTags.filter((t) => usedTagIds.includes(t.id));

    // Get all pictures used by these URLs
    const allPictures = await this.getAllPictures();
    const usedPictureIds = [
      ...new Set(profileUrls.map((u) => u.picture).filter(Boolean) as ID[]),
    ];
    const profilePictures = allPictures.filter((p) =>
      usedPictureIds.includes(p.id)
    );

    // Get the theme for this profile
    const allThemes = await this.getAllThemes();
    const profileThemes = allThemes.filter((t) => t.id === profile.theme);

    return {
      pictures: profilePictures,
      tags: profileTags,
      urls: profileUrls,
      themes: profileThemes,
      categories: profileCategories,
      profiles: [profile],
    };
  }

  async importData(data: {
    pictures?: Picture[];
    tags?: Tag[];
    urls?: Url[];
    themes?: Theme[];
    categories?: Category[];
    profiles?: Profile[];
  }): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    const transaction = this.db.transaction(Object.values(STORES), "readwrite");

    const promises: Promise<void>[] = [];

    if (data.pictures) {
      promises.push(
        this.bulkAdd(transaction.objectStore(STORES.PICTURES), data.pictures)
      );
    }
    if (data.tags) {
      promises.push(
        this.bulkAdd(transaction.objectStore(STORES.TAGS), data.tags)
      );
    }
    if (data.urls) {
      promises.push(
        this.bulkAdd(transaction.objectStore(STORES.URLS), data.urls)
      );
    }
    if (data.themes) {
      promises.push(
        this.bulkAdd(transaction.objectStore(STORES.THEMES), data.themes)
      );
    }
    if (data.categories) {
      promises.push(
        this.bulkAdd(
          transaction.objectStore(STORES.CATEGORIES),
          data.categories
        )
      );
    }
    if (data.profiles) {
      promises.push(
        this.bulkAdd(transaction.objectStore(STORES.PROFILES), data.profiles)
      );
    }

    await Promise.all(promises);
  }

  /**
   * Clear all user data (keeps readonly preloaded data)
   */
  async clearUserData(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    const stores = [
      STORES.PICTURES,
      STORES.TAGS,
      STORES.URLS,
      STORES.THEMES,
      STORES.CATEGORIES,
      STORES.PROFILES,
    ];

    for (const storeName of stores) {
      const items = await this.getAllItems<{ id: ID; readonly: boolean }>(
        storeName
      );
      const userItems = items.filter((item) => !item.readonly);

      for (const item of userItems) {
        await this.deleteItem(storeName, item.id);
      }
    }
  }

  /**
   * UrlClickEvent CRUD operations
   */
  async addUrlClickEvent(urlId: ID): Promise<UrlClickEvent> {
    if (!this.db) throw new Error("Database not initialized");

    const now = new Date();
    const clickEvent: Omit<UrlClickEvent, "id"> = {
      urlId,
      timestamp: now,
      hour: now.getHours(),
      weekday: now.getDay(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [STORES.URL_CLICK_EVENTS],
        "readwrite"
      );
      const store = transaction.objectStore(STORES.URL_CLICK_EVENTS);
      const request = store.add(clickEvent);

      request.onsuccess = () => {
        const fullEvent = { ...clickEvent, id: request.result as number };
        resolve(fullEvent as UrlClickEvent);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllUrlClickEvents(): Promise<UrlClickEvent[]> {
    return this.getAllItems<UrlClickEvent>(STORES.URL_CLICK_EVENTS);
  }

  async getUrlClickEventsByUrl(urlId: ID): Promise<UrlClickEvent[]> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [STORES.URL_CLICK_EVENTS],
        "readonly"
      );
      const store = transaction.objectStore(STORES.URL_CLICK_EVENTS);
      const index = store.index("urlId");
      const request = index.getAll(urlId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getUrlClickEventsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<UrlClickEvent[]> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [STORES.URL_CLICK_EVENTS],
        "readonly"
      );
      const store = transaction.objectStore(STORES.URL_CLICK_EVENTS);
      const index = store.index("timestamp");
      const range = IDBKeyRange.bound(startDate, endDate);
      const request = index.getAll(range);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllUrlClickEvents(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [STORES.URL_CLICK_EVENTS],
        "readwrite"
      );
      const store = transaction.objectStore(STORES.URL_CLICK_EVENTS);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Factory Reset - Completely wipe the database
   */
  async factoryReset(): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    // Close the current database connection
    this.db.close();

    // Delete the entire database
    return new Promise((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(DB_NAME);

      deleteRequest.onsuccess = () => {
        this.db = null;
        resolve();
      };

      deleteRequest.onerror = () => reject(deleteRequest.error);

      deleteRequest.onblocked = () => {
        reject(
          new Error(
            "Database deletion blocked. Please close all tabs using this application and try again."
          )
        );
      };
    });
  }

  /**
   * Get ThemeData structure for a specific profile
   * This combines profile, categories, URLs, and pictures into the format expected by theme components
   */
  async getThemeDataByProfileId(profileId: ID): Promise<ThemeData | null> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      // Get the profile
      const profile = await this.getProfile(profileId);
      if (!profile) return null;

      // Get all categories for this profile
      const allCategories = await this.getAllCategories();
      const profileCategories = allCategories.filter((cat) =>
        profile.categories.includes(cat.id)
      );

      // Get all URLs and pictures
      const [allUrls, allPictures] = await Promise.all([
        this.getAllUrls(),
        this.getAllPictures(),
      ]);

      // Create picture lookup map
      const pictureMap = new Map<ID, Picture>();
      allPictures.forEach((pic) => pictureMap.set(pic.id, pic));

      // Build ThemeData structure
      const themeData: ThemeData = {
        categories: profileCategories.map((category) => ({
          displayName: category.name,
          urls: category.urls
            .map((urlId) => {
              const url = allUrls.find((u) => u.id === urlId);
              if (!url) return null;

              const picture = url.picture
                ? pictureMap.get(url.picture)
                : undefined;

              return {
                id: url.id,
                name: url.name,
                url: url.url,
                picture: picture
                  ? { base64ImageData: picture.base64ImageData }
                  : undefined,
              };
            })
            .filter((url): url is NonNullable<typeof url> => url !== null),
        })),
      };

      // Add recent category if enabled
      if (profile.includeRecentCategory) {
        const recentUrls = await this.getRecentUrls(profile.numRecentToShow);
        if (recentUrls.length > 0) {
          themeData.categories.unshift({
            displayName: "Recent",
            urls: recentUrls.map((url) => {
              const picture = url.picture
                ? pictureMap.get(url.picture)
                : undefined;
              return {
                id: url.id,
                name: url.name,
                url: url.url,
                picture: picture
                  ? { base64ImageData: picture.base64ImageData }
                  : undefined,
              };
            }),
          });
        }
      }

      return themeData;
    } catch (error) {
      console.error("Failed to get theme data for profile:", error);
      return null;
    }
  }

  /**
   * Get recent URLs based on click events
   */
  async getRecentUrls(limit: number = 5): Promise<Url[]> {
    if (!this.db) throw new Error("Database not initialized");

    try {
      const [allUrls, clickEvents] = await Promise.all([
        this.getAllUrls(),
        this.getAllUrlClickEvents(),
      ]);

      // Group clicks by URL and get most recent timestamp for each
      const urlLastClicked = new Map<ID, Date>();
      clickEvents.forEach((event) => {
        const existing = urlLastClicked.get(event.urlId);
        if (!existing || event.timestamp > existing) {
          urlLastClicked.set(event.urlId, event.timestamp);
        }
      });

      // Sort URLs by most recent click and return top results
      return allUrls
        .filter((url) => urlLastClicked.has(url.id))
        .sort((a, b) => {
          const aTime = urlLastClicked.get(a.id)!.getTime();
          const bTime = urlLastClicked.get(b.id)!.getTime();
          return bTime - aTime;
        })
        .slice(0, limit);
    } catch (error) {
      console.error("Failed to get recent URLs:", error);
      return [];
    }
  }

  // ...existing code...
}

// Export singleton instance
export const dbAPI = new DatabaseAPI();

// Helper functions for easier usage
export const db = {
  // Initialize database
  init: () => dbAPI.initialize(),

  // Pictures
  pictures: {
    get: (id: ID) => dbAPI.getPicture(id),
    getAll: () => dbAPI.getAllPictures(),
    create: (data: CreatePicture) => dbAPI.createPicture(data),
    update: (data: UpdatePicture) => dbAPI.updatePicture(data),
    delete: (id: ID) => dbAPI.deletePicture(id),
  },

  // Tags
  tags: {
    get: (id: ID) => dbAPI.getTag(id),
    getAll: () => dbAPI.getAllTags(),
    create: (data: CreateTag) => dbAPI.createTag(data),
    update: (data: UpdateTag) => dbAPI.updateTag(data),
    delete: (id: ID) => dbAPI.deleteTag(id),
  },

  // URLs
  urls: {
    get: (id: ID) => dbAPI.getUrl(id),
    getAll: () => dbAPI.getAllUrls(),
    create: (data: CreateUrl) => dbAPI.createUrl(data),
    update: (data: UpdateUrl) => dbAPI.updateUrl(data),
    delete: (id: ID) => dbAPI.deleteUrl(id),
    search: (query: string) => dbAPI.searchUrls(query),
    getByTag: (tagId: ID) => dbAPI.getUrlsByTag(tagId),
    getByCategory: (categoryId: ID) => dbAPI.getUrlsByCategory(categoryId),
  },

  // Themes
  themes: {
    get: (id: ID) => dbAPI.getTheme(id),
    getAll: () => dbAPI.getAllThemes(),
    create: (data: CreateTheme) => dbAPI.createTheme(data),
    update: (data: UpdateTheme) => dbAPI.updateTheme(data),
    delete: (id: ID) => dbAPI.deleteTheme(id),
  },

  // Categories
  categories: {
    get: (id: ID) => dbAPI.getCategory(id),
    getAll: () => dbAPI.getAllCategories(),
    create: (data: CreateCategory) => dbAPI.createCategory(data),
    update: (data: UpdateCategory) => dbAPI.updateCategory(data),
    delete: (id: ID) => dbAPI.deleteCategory(id),
  },

  // Profiles
  profiles: {
    get: (id: ID) => dbAPI.getProfile(id),
    getAll: () => dbAPI.getAllProfiles(),
    create: (data: CreateProfile) => dbAPI.createProfile(data),
    update: (data: UpdateProfile) => dbAPI.updateProfile(data),
    delete: (id: ID) => dbAPI.deleteProfile(id),
  },

  // URL Click Events
  urlClickEvents: {
    add: (urlId: ID) => dbAPI.addUrlClickEvent(urlId),
    getAll: () => dbAPI.getAllUrlClickEvents(),
    getByUrl: (urlId: ID) => dbAPI.getUrlClickEventsByUrl(urlId),
    getByDateRange: (startDate: Date, endDate: Date) =>
      dbAPI.getUrlClickEventsByDateRange(startDate, endDate),
    clear: () => dbAPI.clearAllUrlClickEvents(),
  },

  // Theme Data utilities
  getThemeDataByProfileId: (profileId: ID) =>
    dbAPI.getThemeDataByProfileId(profileId),
  getRecentUrls: (limit?: number) => dbAPI.getRecentUrls(limit),

  // Utility functions
  export: () => dbAPI.exportData(),
  exportProfile: (profileId: ID) => dbAPI.exportProfileData(profileId),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  import: (data: any) => dbAPI.importData(data),
  clearUserData: () => dbAPI.clearUserData(),
  factoryReset: () => dbAPI.factoryReset(),
};

export default db;
