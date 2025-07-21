# Database Implementation

This implementation provides a complete IndexedDB-based data management system for the New Tab Page application with preloaded readonly data and full CRUD operations for user-created content.

## Features

### Data Types with Readonly Support

All 6 main resource types now include a `readonly` boolean flag:

- **Pictures**: Image icons for URLs (base64 encoded)
- **Tags**: For categorizing and filtering URLs
- **URLs**: Bookmarked links with tags and pictures
- **Themes**: Dynamic React components with editable source code and isolated globals
- **Categories**: Groups of related URLs
- **Profiles**: User contexts with categories and themes

### Readonly Protection

- Preloaded data is marked as `readonly: true`
- Users cannot create items with `readonly: true`
- Users cannot modify the `readonly` property
- Readonly items cannot be updated or deleted
- CRUD operations automatically enforce these restrictions

### Preloaded Data

The system includes sample preloaded data:

- **6 Pictures**: Common website icons (Google, GitHub, Stack Overflow, etc.)
- **6 Tags**: Development, Social Media, News, Entertainment, Productivity, Learning
- **6 URLs**: Popular websites with associated tags and pictures
- **4 Themes**: Default Light, Dark Mode, Minimal, Colorful
- **3 Categories**: Development Tools, Social & News, General
- **3 Profiles**: Default, Work, Personal

### Database Architecture

#### IndexedDB Implementation (`src/lib/db.ts`)

- **Database**: `NewTabPageDB` (version 1)
- **Object Stores**: pictures, tags, urls, themes, categories, profiles, metadata
- **Automatic initialization** with preloaded data on first run
- **Metadata tracking** to ensure preloaded data is only loaded once

#### CRUD Operations

Each resource type provides full CRUD operations:

```typescript
// Create (readonly: false automatically set)
await db.urls.create({ name: "Example", url: "https://example.com", tags: [] });

// Read
const url = await db.urls.get(id);
const allUrls = await db.urls.getAll();

// Update (throws error if readonly)
await db.urls.update({ id, name: "Updated Name" });

// Delete (throws error if readonly)
await db.urls.delete(id);
```

#### Utility Functions

- `searchUrls(query)`: Full-text search across URL names and URLs
- `getUrlsByTag(tagId)`: Get all URLs with specific tag
- `getUrlsByCategory(categoryId)`: Get URLs in a category
- `exportData()`: Export all data for backup
- `importData(data)`: Import data from backup
- `clearUserData()`: Remove all user-created items (keeps readonly data)

### React Integration

#### Database Hooks (`src/hooks/useDatabase.ts`)

Provides React hooks for each resource type:

```typescript
const { urls, createUrl, updateUrl, deleteUrl, searchUrls } = useUrls();
const { tags, createTag, updateTag, deleteTag } = useTags();
// ... similar hooks for all resource types
```

#### Database Provider (`src/components/DatabaseProvider.tsx`)

Handles database initialization and provides loading/error states:

```typescript
<DatabaseProvider>
  <YourApp />
</DatabaseProvider>
```

#### Demo Component (`src/components/DatabaseDemo.tsx`)

Interactive demo showing:

- All preloaded data organized by tabs
- CRUD operation testing
- Readonly protection demonstration
- Data summary with preloaded vs custom counts

## Usage Examples

### Basic Setup

```typescript
import { db } from "@/lib/db";

// Initialize database (call once at app startup)
await db.init();

// Database is ready to use
const urls = await db.urls.getAll();
```

### Using React Hooks

```typescript
import { useUrls } from "@/hooks/useDatabase";

function UrlManager() {
  const { urls, createUrl, deleteUrl, isLoading, error } = useUrls();

  const handleCreate = async () => {
    try {
      await createUrl({
        name: "My Site",
        url: "https://mysite.com",
        tags: [],
      });
    } catch (error) {
      console.error("Failed to create URL:", error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {urls.map((url) => (
        <div key={url.id}>
          {url.name} {url.readonly && "(readonly)"}
          {!url.readonly && (
            <button onClick={() => deleteUrl(url.id)}>Delete</button>
          )}
        </div>
      ))}
      <button onClick={handleCreate}>Add URL</button>
    </div>
  );
}
```

### Error Handling

The system provides comprehensive error handling:

- **Database initialization errors**: Network/permission issues
- **CRUD operation errors**: Readonly violations, not found, etc.
- **Type safety**: TypeScript ensures correct data structure
- **Validation**: Automatic ID generation and readonly enforcement

### Data Migration

The database automatically handles:

- **First-time setup**: Creates tables and loads preloaded data
- **Version upgrades**: Future schema changes can be handled in `onupgradeneeded`
- **Data persistence**: User data persists across browser sessions
- **Import/Export**: Backup and restore functionality

## File Structure

```
src/
├── types/index.ts              # Updated types with readonly flags
├── data/preloaded.ts          # Mock preloaded data
├── lib/db.ts                  # IndexedDB implementation
├── hooks/useDatabase.ts       # React hooks for data management
└── components/
    ├── DatabaseProvider.tsx   # Database initialization provider
    └── DatabaseDemo.tsx       # Interactive demo component
```

## Testing the Implementation

1. **Start the application**: The database will automatically initialize
2. **View preloaded data**: See the demo page with all 6 resource types
3. **Test CRUD operations**: Create custom items using the demo interface
4. **Test readonly protection**: Try to delete preloaded items (will fail)
5. **Verify persistence**: Refresh the page and see data is preserved

The implementation is production-ready and provides a solid foundation for building the complete New Tab Page application with proper data management and user experience.
