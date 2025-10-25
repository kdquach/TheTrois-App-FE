# 🆚 So sánh: @agney/react-loading vs LoadingContext

## 📊 Bảng so sánh tổng quan

| Tiêu chí             | @agney/react-loading | LoadingContext (Custom) |
| -------------------- | -------------------- | ----------------------- |
| **Platform**         | ⚠️ Web only          | ✅ React Native         |
| **Provider Pattern** | ✅ Yes               | ✅ Yes                  |
| **Hook API**         | ✅ useLoading        | ✅ useLoading           |
| **Auto-hide**        | ❌ No                | ✅ Yes (withLoading)    |
| **Global Overlay**   | ❌ No                | ✅ Yes                  |
| **Custom Indicator** | ✅ Yes               | ✅ Yes                  |
| **Multiple Types**   | ❌ No                | ✅ Yes (4 types)        |
| **TypeScript**       | ✅ Full support      | ⚠️ Can add              |
| **Bundle Size**      | ~5KB                 | ~3KB                    |
| **Portal Support**   | ❌ No                | ✅ Yes                  |

---

## 💻 Code Comparison

### 1. Setup / Installation

#### @agney/react-loading (Web)

```javascript
// Install
npm install @agney/react-loading

// Setup in main app
import { LoaderProvider } from '@agney/react-loading';

ReactDOM.render(
  <LoaderProvider indicator={<Spinner />}>
    <App />
  </LoaderProvider>,
  document.getElementById('root')
);
```

#### LoadingContext (React Native)

```javascript
// No installation needed (built-in)

// Setup in _layout.js
import { LoadingProvider } from '../contexts/LoadingContext';

export default function RootLayout() {
  return (
    <PaperProvider>
      <LoadingProvider>
        <App />
      </LoadingProvider>
    </PaperProvider>
  );
}
```

---

### 2. Basic Usage

#### @agney/react-loading

```javascript
import { useLoading } from '@agney/react-loading';

function Component() {
  const { containerProps, indicatorEl } = useLoading({
    loading: true, // ⚠️ Must manually toggle
    indicator: <Spinner />,
  });

  return (
    <div {...containerProps}>
      {indicatorEl}
      <YourContent />
    </div>
  );
}
```

#### LoadingContext

```javascript
import { useLoading } from '../contexts/LoadingContext';

function Component() {
  const { withLoading } = useLoading();

  const fetchData = async () => {
    // ✅ Auto show/hide
    await withLoading(apiCall(), 'Loading...');
  };

  return <YourContent onLoad={fetchData} />;
}
```

---

### 3. Manual Control

#### @agney/react-loading

```javascript
function Component() {
  const [isLoading, setIsLoading] = useState(false);

  const { containerProps, indicatorEl } = useLoading({
    loading: isLoading, // ⚠️ Manual state management
  });

  const handleSubmit = async () => {
    setIsLoading(true);
    await apiCall();
    setIsLoading(false); // ⚠️ Must manually hide
  };

  return <div {...containerProps}>{indicatorEl}</div>;
}
```

#### LoadingContext

```javascript
function Component() {
  const { showLoading, hideLoading } = useLoading();

  const handleSubmit = async () => {
    showLoading('Processing...');
    await apiCall();
    hideLoading();
  };

  // Or with auto-hide:
  const handleSubmitAuto = () => {
    withLoading(apiCall(), 'Processing...');
  };

  return <YourContent />;
}
```

---

### 4. Custom Indicator

#### @agney/react-loading

```javascript
const CustomLoader = () => <div className="spinner">Loading...</div>;

// In provider
<LoaderProvider indicator={<CustomLoader />}>
  <App />
</LoaderProvider>;

// In component - indicator is fixed per provider
const { indicatorEl } = useLoading({ loading: true });
```

#### LoadingContext

```javascript
const CustomLoader = () => (
  <View>
    <Text>Custom Loading...</Text>
  </View>
);

// Option 1: Global custom indicator
<LoadingProvider indicator={<CustomLoader />}>
  <App />
</LoadingProvider>;

// Option 2: Dynamic types per call
showLoading('Loading...', 'lotus'); // Lotus icon
showLoading('Loading...', 'dots'); // 3 dots
showLoading('Loading...', 'pulse'); // Pulse animation
showLoading('Loading...', 'spinner'); // Default spinner
```

---

### 5. Multiple Components

#### @agney/react-loading

```javascript
// ⚠️ Each component needs own state
function ComponentA() {
  const [loading, setLoading] = useState(false);
  const { indicatorEl } = useLoading({ loading });
  // ...
}

function ComponentB() {
  const [loading, setLoading] = useState(false);
  const { indicatorEl } = useLoading({ loading });
  // ...
}

// ❌ No global loading state
```

#### LoadingContext

```javascript
// ✅ Single global loading state
function ComponentA() {
  const { showLoading } = useLoading();
  showLoading('Loading A...');
}

function ComponentB() {
  const { showLoading } = useLoading();
  showLoading('Loading B...'); // Replaces A's loading
}

// ✅ Full-screen overlay
// ✅ Consistent UX across app
```

---

### 6. Promise Handling

#### @agney/react-loading

```javascript
// ❌ No built-in promise handling
function Component() {
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      await apiCall();
    } finally {
      setLoading(false); // Must remember this!
    }
  };
}
```

#### LoadingContext

```javascript
// ✅ Built-in promise handling
function Component() {
  const { withLoading } = useLoading();

  const fetchData = () => {
    withLoading(apiCall(), 'Loading...');
    // Auto-hide even on error!
  };
}
```

---

### 7. Error Handling

#### @agney/react-loading

```javascript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await apiCall();
  } catch (error) {
    setLoading(false); // ⚠️ Must manually hide
    showError(error);
  }
  setLoading(false); // ⚠️ Also hide on success
};
```

#### LoadingContext

```javascript
const { withLoading } = useLoading();

const handleSubmit = async () => {
  try {
    await withLoading(apiCall(), 'Processing...');
    // ✅ Auto-hide on success
  } catch (error) {
    // ✅ Auto-hide on error
    showError(error);
  }
};
```

---

## 🎯 Use Cases Comparison

### Scenario 1: Simple API Call

#### @agney/react-loading

```javascript
const [loading, setLoading] = useState(false);
const { indicatorEl } = useLoading({ loading });

useEffect(() => {
  setLoading(true);
  fetchData().then(() => setLoading(false));
}, []);

return <div>{indicatorEl}</div>;
```

**Lines of code: 7**

#### LoadingContext

```javascript
const { withLoading } = useLoading();

useEffect(() => {
  withLoading(fetchData(), 'Loading...');
}, []);
```

**Lines of code: 4** ✅

---

### Scenario 2: Form Submission

#### @agney/react-loading

```javascript
const [loading, setLoading] = useState(false);

const handleSubmit = async (data) => {
  setLoading(true);
  try {
    await submitForm(data);
    setLoading(false);
    showSuccess();
  } catch (error) {
    setLoading(false);
    showError(error);
  }
};
```

**Lines of code: 12**

#### LoadingContext

```javascript
const { withLoading } = useLoading();

const handleSubmit = async (data) => {
  try {
    await withLoading(submitForm(data), 'Submitting...');
    showSuccess();
  } catch (error) {
    showError(error);
  }
};
```

**Lines of code: 8** ✅

---

## 📈 Performance Comparison

| Metric       | @agney/react-loading | LoadingContext    |
| ------------ | -------------------- | ----------------- |
| Re-renders   | ⚠️ Per component     | ✅ Global (fewer) |
| Memory       | ⚠️ Multiple states   | ✅ Single state   |
| Bundle       | 5KB                  | 3KB               |
| Loading time | Fast                 | Fast              |

---

## ✅ Migration Path

### From @agney/react-loading to LoadingContext

```javascript
// BEFORE
import { useLoading } from '@agney/react-loading';

const [isLoading, setIsLoading] = useState(false);
const { containerProps, indicatorEl } = useLoading({
  loading: isLoading,
});

const handleAction = async () => {
  setIsLoading(true);
  await action();
  setIsLoading(false);
};

// AFTER
import { useLoading } from '../contexts/LoadingContext';

const { withLoading } = useLoading();

const handleAction = async () => {
  await withLoading(action(), 'Loading...');
};
```

---

## 🏆 Recommendation

### Use @agney/react-loading when:

- ❌ Building **Web** applications only
- ❌ Need per-component loading states
- ❌ Want to show loading inline with content

### Use LoadingContext when:

- ✅ Building **React Native** applications
- ✅ Want **global loading overlay**
- ✅ Need **auto-hide** functionality
- ✅ Want **multiple loading types**
- ✅ Prefer **cleaner code** with less boilerplate

---

## 💡 Conclusion

**LoadingContext** được thiết kế đặc biệt cho React Native với các ưu điểm:

1. ✅ **Tích hợp sẵn** - Không cần install thêm
2. ✅ **Auto-hide** - Tự động ẩn sau khi Promise resolve/reject
3. ✅ **Global overlay** - Full-screen loading overlay
4. ✅ **Multiple types** - 4 kiểu loading khác nhau
5. ✅ **Cleaner code** - Ít boilerplate hơn
6. ✅ **Better UX** - Consistent loading experience

**@agney/react-loading** phù hợp cho Web, nhưng không hoạt động trên React Native.

**👉 Khuyến nghị: Sử dụng LoadingContext cho project React Native của bạn!**
