# Blood Group Formatting - Quick Reference

## 🎯 Problem
Backend stores: `A_POSITIVE`, `B_NEGATIVE`, etc.
Users want to see: `A+`, `B-`, etc.

## ✅ Solution
Use the `bloodGroupFormatter` utility to convert between formats.

---

## 📦 Files Created

### JavaScript Version
```
d:\Documents\muktsarNgo\app\muktsarngo\src\utils\bloodGroupFormatter.js
```

### TypeScript Version
```
d:\Documents\muktsarNgo\app\muktsarngo\src\utils\bloodGroupFormatter.ts
```

---

## 🚀 Quick Usage

### 1. Display Blood Group (Most Common)

```javascript
import { formatBloodGroup } from '../utils/bloodGroupFormatter';

// In your component
<Text>{formatBloodGroup(donor.bloodGroup)}</Text>
// Shows: "A+" instead of "A_POSITIVE"
```

### 2. Blood Group Picker

```javascript
import { getBloodGroupOptions } from '../utils/bloodGroupFormatter';

const bloodGroupOptions = getBloodGroupOptions();

<Picker
  selectedValue={bloodGroup}
  onValueChange={setBloodGroup}
>
  {bloodGroupOptions.map(option => (
    <Picker.Item 
      label={option.label}  // Shows "A+", "B-"
      value={option.value}  // Sends "A_POSITIVE", "B_NEGATIVE"
    />
  ))}
</Picker>
```

### 3. Colored Badge

```javascript
import { formatBloodGroup, getBloodGroupColor } from '../utils/bloodGroupFormatter';

<View style={{ backgroundColor: getBloodGroupColor(bloodGroup) }}>
  <Text>{formatBloodGroup(bloodGroup)}</Text>
</View>
```

---

## 📋 All Available Functions

| Function | Input | Output | Use Case |
|----------|-------|--------|----------|
| `formatBloodGroup()` | `"A_POSITIVE"` | `"A+"` | Display to user |
| `parseBloodGroup()` | `"A+"` | `"A_POSITIVE"` | Send to backend |
| `getBloodGroupOptions()` | - | `[{label: "A+", value: "A_POSITIVE"}, ...]` | Picker/Dropdown |
| `getAllBloodGroups()` | - | `["A+", "A-", "B+", ...]` | List all options |
| `getBloodGroupColor()` | `"A_POSITIVE"` or `"A+"` | `"#FF6B6B"` | UI styling |

---

## 🎨 Blood Group Colors

| Blood Group | Color | Hex Code |
|-------------|-------|----------|
| A+ | 🔴 Red | `#FF6B6B` |
| A- | 🔴 Light Red | `#FF8787` |
| B+ | 🔵 Teal | `#4ECDC4` |
| B- | 🔵 Light Teal | `#6EDDD6` |
| AB+ | 🟡 Yellow | `#FFE66D` |
| AB- | 🟡 Light Yellow | `#FFF099` |
| O+ | 🟢 Mint | `#95E1D3` |
| O- | 🟢 Light Mint | `#B8F3E9` |

---

## 💡 Common Patterns

### Pattern 1: Display in List
```javascript
{donors.map(donor => (
  <Text key={donor.id}>
    {donor.name} - {formatBloodGroup(donor.bloodGroup)}
  </Text>
))}
```

### Pattern 2: Registration Form
```javascript
const [bloodGroup, setBloodGroup] = useState('');

// In form
<Picker
  selectedValue={bloodGroup}
  onValueChange={setBloodGroup}
>
  {getBloodGroupOptions().map(opt => (
    <Picker.Item label={opt.label} value={opt.value} />
  ))}
</Picker>

// When submitting
await axios.post('/api/auth/register', {
  ...formData,
  bloodGroup, // Already in backend format
});
```

### Pattern 3: Profile Display
```javascript
<View style={styles.profileCard}>
  <Text>Blood Group</Text>
  <View style={{
    backgroundColor: getBloodGroupColor(donor.bloodGroup),
    padding: 10,
    borderRadius: 8,
  }}>
    <Text style={{ color: '#fff', fontWeight: 'bold' }}>
      {formatBloodGroup(donor.bloodGroup)}
    </Text>
  </View>
</View>
```

---

## ⚠️ Important Notes

1. **Always format for display**: Use `formatBloodGroup()` whenever showing to users
2. **Backend format unchanged**: API still expects `A_POSITIVE`, `B_NEGATIVE`, etc.
3. **Picker values**: Use `getBloodGroupOptions()` - it handles both formats automatically
4. **No backend changes needed**: This is purely a frontend formatting solution

---

## 🔄 Data Flow

```
User Sees          →  Component State  →  API Request
"A+"                  "A_POSITIVE"        "A_POSITIVE"
   ↑                                           ↓
formatBloodGroup()                      API Response
   ↑                                           ↓
"A_POSITIVE"      ←  Component State  ←  "A_POSITIVE"
```

---

## ✅ Checklist for Implementation

- [ ] Copy `bloodGroupFormatter.js` or `.ts` to your utils folder
- [ ] Import `formatBloodGroup` in components that display blood groups
- [ ] Use `getBloodGroupOptions()` in registration/edit forms
- [ ] Replace all instances of `{donor.bloodGroup}` with `{formatBloodGroup(donor.bloodGroup)}`
- [ ] Test registration - ensure backend still receives correct format
- [ ] Test display - ensure users see "A+", "B-", etc.
- [ ] Optional: Add colored badges using `getBloodGroupColor()`

---

## 🧪 Quick Test

After implementation, verify:

1. **Registration**: Select "A+" in picker → Backend receives "A_POSITIVE" ✅
2. **Display**: API returns "A_POSITIVE" → User sees "A+" ✅
3. **Profile**: Blood group shows as "B-" not "B_NEGATIVE" ✅
4. **Filter**: Selecting "O+" filters correctly ✅

---

## 📞 Need Help?

If blood groups aren't displaying correctly:
1. Check import path: `import { formatBloodGroup } from '../utils/bloodGroupFormatter'`
2. Verify you're calling the function: `formatBloodGroup(bloodGroup)` not just `bloodGroup`
3. Check the value from API: `console.log('Blood Group:', donor.bloodGroup)`
4. Ensure backend is sending correct format: Should be `A_POSITIVE`, not `A+`

---

## 🎉 Result

**Before:**
```
Name: John Doe
Blood Group: A_POSITIVE
```

**After:**
```
Name: John Doe
Blood Group: A+
```

Much better! 🎊

