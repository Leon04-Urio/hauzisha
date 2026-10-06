# 🔍 Debug Upload/Delete - Step by Step

## Added Debug Logging

I've added console logging to help identify where the property ID is getting lost.

## How to Debug

### Step 1: Open Browser Console
1. Press F12
2. Go to Console tab
3. Clear any existing logs

### Step 2: Try to Upload Images
1. Edit a property
2. Click "Add More Images"
3. Look at console - should see:
```
openImageUploadForEdit called
Form: <form>
Property ID: 16
Set uploadPropertyId to: 16
```

4. Select images
5. Click Upload
6. Look at console - should see:
```
Form submission:
Property ID from form: 16
Current mode: edit
Global property ID: 16
```

### Step 3: Check What's Wrong

#### If you see "Property ID: null"
**Problem:** Form doesn't have dataset.id set

**Solution:** The edit modal isn't loading properly. Check:
```javascript
// In console, run:
document.getElementById("editPropertyForm").dataset.id
```
Should return a number, not undefined

#### If you see "Field value: " (empty)
**Problem:** uploadPropertyId field isn't being set

**Solution:** Modal might be opening before the field is set. Try:
1. Close modal
2. Reopen edit modal
3. Try again

#### If you see "field not found"
**Problem:** Modal HTML not loaded

**Solution:** Check if modal is included:
```html
<!-- Should be in properties.php -->
<?php include 'modals/image-upload-modal.php'; ?>
```

## Common Issues

### Issue 1: Property ID is NULL
**Symptoms:**
- Console shows "Property ID: null"
- Alert says "No property selected"

**Fix:**
The edit form isn't setting the ID. Check the view-btn click handler:
```javascript
form.dataset.id = id; // This line must execute
```

### Issue 2: Field Not Found
**Symptoms:**
- Console shows "uploadPropertyId field not found!"
- Modal doesn't have the hidden field

**Fix:**
Make sure `image-upload-modal.php` is included in `properties.php`

### Issue 3: ID Lost on Submit
**Symptoms:**
- ID shows correctly when opening modal
- But "Property ID from form: " is empty on submit

**Fix:**
The form might be resetting. Check if form.reset() is being called somewhere.

## Manual Test

Open browser console and run:

```javascript
// Test 1: Check if form exists
console.log('Form:', document.getElementById("editPropertyForm"));

// Test 2: Check if form has ID
console.log('Form ID:', document.getElementById("editPropertyForm")?.dataset?.id);

// Test 3: Check if upload field exists
console.log('Upload field:', document.getElementById('uploadPropertyId'));

// Test 4: Check field value
console.log('Field value:', document.getElementById('uploadPropertyId')?.value);

// Test 5: Manually set the value
document.getElementById('uploadPropertyId').value = '16';
console.log('After manual set:', document.getElementById('uploadPropertyId').value);
```

## Expected Console Output

### When Opening Modal:
```
openImageUploadForEdit called
Form: <form id="editPropertyForm">...</form>
Property ID: 16
Set uploadPropertyId to: 16
```

### When Submitting:
```
Form submission:
Property ID from form: 16
Current mode: edit
Global property ID: 16
```

### When Deleting:
```
deletePropertyImage called with: 123, 16
```

## If Debugging Shows Everything is Correct

If the console shows the property ID is set correctly but you still get errors, the issue is on the backend.

Check:
1. Network tab - what's the actual request?
2. Response - what error is the API returning?
3. PHP error logs - any PHP errors?

## Quick Fix

If nothing works, try this manual workaround:

```javascript
// In browser console, before uploading:
document.getElementById('uploadPropertyId').value = '16'; // Replace 16 with your property ID
```

Then try uploading again.

## Report Back

After checking the console, tell me:
1. What does "Property ID:" show?
2. What does "Property ID from form:" show?
3. Any error messages?
4. What's in the Network tab for the upload request?

This will help me identify the exact issue!
