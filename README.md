# Place Explorer

A mobile application for discovering places, viewing detailed information, sharing locations, writing reviews, checking in, saving favorite places, and getting directions with multiple route options.

<p align="center">
  <img width="220" alt="login1" src="https://github.com/user-attachments/assets/478342c1-01c6-4dcc-bfcf-b03b804676f1" />
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img width="220" alt="login2" src="https://github.com/user-attachments/assets/c4124c53-4582-4679-acb6-195e789e0170" />
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img width="220" alt="trang1" src="https://github.com/user-attachments/assets/d8528a7d-6741-4bbd-bdcf-3d51ed692dec" />
</p>

<p align="center">
  <img width="220" alt="trang15" src="https://github.com/user-attachments/assets/2cc85f5e-9f39-4cd1-adb3-4adbffdfe6de" />
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img width="220" alt="trang14" src="https://github.com/user-attachments/assets/244d7f18-826e-48ff-a21f-5aa25ab34933" />
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img width="220" alt="trang2" src="https://github.com/user-attachments/assets/de253d77-8f86-43ce-91d9-ec442f8b4e08" />
</p>

<p align="center">
  <img width="220" alt="trang3" src="https://github.com/user-attachments/assets/26726f16-0387-42b5-b7d5-c4df06120ca1" />
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img width="220" alt="trang4" src="https://github.com/user-attachments/assets/8b21a117-6c17-485a-b692-9954e0d9c65f" />
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img width="220" alt="trang16" src="https://github.com/user-attachments/assets/2517ca40-94d5-4c6a-89fa-4fbc9ae4dfa0" />
</p>

<p align="center">
  <img width="220" alt="trang12" src="https://github.com/user-attachments/assets/05325685-671f-4c59-af22-0472872f6871" />
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img width="220" alt="trang13" src="https://github.com/user-attachments/assets/b45935e9-1e1d-4d7d-b5f8-d25f0567ea4c" />
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img width="220" alt="trang5" src="https://github.com/user-attachments/assets/0dd90d31-5839-4eb4-9555-82e6c403fb68" />
</p>

<p align="center">
  <img width="220" alt="trang6" src="https://github.com/user-attachments/assets/3efd319e-b968-491e-9f8c-1bf0ba25d90d" />
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img width="220" alt="trang7" src="https://github.com/user-attachments/assets/be44b601-a2cf-4afd-9be6-a5a499c49504" />
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img width="220" alt="trang8" src="https://github.com/user-attachments/assets/f07db08e-d82e-49ff-9823-3cfc46fbe374" />
</p>

<p align="center">
  <img width="220" alt="trang9" src="https://github.com/user-attachments/assets/5d6cc009-7439-45a7-8cf9-443dd9d7d619" />
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img width="220" alt="trang10" src="https://github.com/user-attachments/assets/cf53fbf4-6e39-49d3-ba31-2208555cb0ce" />
  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
  <img width="220" alt="trang11" src="https://github.com/user-attachments/assets/f4722b4a-1939-466b-ba72-e68fe6539cf8" />
</p>

## Key Features

### 🗺️ Explore Places

- Interactive Google Maps with place markers grouped by category.
- Load places dynamically based on the visible map region.
- Search for places directly from the map.
- View and select the current location.
- Save up to 8 recently selected locations locally.
- Open a selected place directly from other parts of the application.

### 🧭 Advanced Directions

- Get routes between a starting point and destination.
- Support different travel modes such as driving, cycling, and walking.
- Display route distance, estimated travel time, and individual route steps.
- Show multiple alternative routes for users to choose from.
- Interactive polylines allow users to select different routes directly on the map.
- Long-distance routing is optimized to maintain both performance and route accuracy.
- Automatically handle GPS activation and location permission requirements.

### 📍 Place Details

- Detailed place information with dedicated review and check-in sections.
- Navigate from a place directly to the directions screen.
- Open a place's location on the map.
- Share places through deep links.
- Support opening shared places whether the application is running or completely closed.

### ⭐ Reviews & Ratings

- Create, update, and delete reviews.
- Rate places using a 1–5 star rating system.
- Filter reviews by rating.
- Upload photos and videos with reviews.
- Store review media on Cloudinary.
- Resize large images before displaying thumbnails to improve memory usage.
- Full-screen image viewing and in-app video playback.
- Prevent accidental navigation away while submitting a review.

### 📸 Check-ins

- Check in at places and display check-in history.
- View check-ins directly from place details.
- View a user's reviews and check-ins from their profile.
- Prevent repeated check-ins at the same place within a short period to reduce spam.

### ❤️ Favorites

- Add and remove favorite places.
- View all favorite places in a dedicated screen.
- Keep favorite state synchronized across the map, place details, and favorites screen.
- Support favorite actions while offline with optimistic UI updates.

### 👤 User Profiles

- View and edit personal information.
- Change password.
- Update avatar.
- View another user's profile from their reviews or check-ins.
- Display the user's review and check-in activity.

### 📶 Offline-First Experience

- Application features continue to work when there is no network connection.
- Optimistic updates provide immediate UI feedback while offline.
- Offline actions are stored in a synchronization queue.
- Automatically synchronize queued operations when the connection is restored.
- Handle add, update, and delete operations while offline without creating conflicting requests.
- Preserve synchronization state when the application is restarted or completely killed.
- Refresh affected cached data after background synchronization.
- Keep user profile and avatar data synchronized between local storage, Redux, and the backend.

### 🌐 Multi-language

- Support multiple languages including Vietnamese, English, Chinese, Japanese, and Korean.
- Translate application UI, validation messages, notifications, and dynamic time values.
- Handle singular, plural, and zero-value translations.
- Allow language selection directly from the application.

### 🌓 Theme

- Light mode and dark mode.
- Persist the selected theme locally.
- Synchronize theme state across the application.
- Google Maps automatically adapts to the selected light/dark theme.
- Custom theme-aware styles reduce hardcoded colors throughout the application.

### ✨ UI & User Experience

- Shimmer and skeleton loading animations instead of relying only on traditional spinners.
- Custom bottom sheets for filters, language selection, and route information.
- Bottom sheet behavior optimized for keyboard interaction.
- Native-style toast notifications.
- Custom navigation headers and back navigation.
- Responsive handling of Android status bar and safe-area insets.
- Optimized map rendering and route geometry to maintain smooth interactions.

## Tech Stack

- **React Native**
- **React Navigation**
- **Google Maps**
- **OpenRouteService (ORS)**
- **OpenStreetMap / Overpass API**
- **Redux Toolkit / RTK Query**
- **AsyncStorage**
- **Cloudinary**
- **i18next / react-i18next**
- **Zod**
- **React Hook Form**
- **React Native Reanimated**
- **JSON Server**
