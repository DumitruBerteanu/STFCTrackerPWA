# Google Sheet Setup Guide

## Recommended Sheet Structure

For the STFC Tracker PWA to work optimally, structure your sheet like this:

### Row 1: Column Headers (Recommended)
```
A1: Task Name / Item Name
B1: Status / Checkbox
C1: Category / Type
D1: Description / Notes
E1: Progress / Value
F1: Other Column
```

### Row 2: Optional Sub-headers or Empty
- Can be empty or used for sub-headers
- The app will try row 1 first, then row 2

### Rows 3-23: Data Rows
- Each row represents one item/task
- Column B should contain checkboxes or TRUE/FALSE values
- Fill in data for columns A, C, D, E, F as needed

## Example Structure

```
Row 1: | Task Name    | Done | Category | Notes        | Progress | Priority |
Row 2: | (empty or sub-headers)                                          |
Row 3: | Mission 1    | TRUE | Missions | Complete     | 100%     | High     |
Row 4: | Research X   | FALSE| Research | In progress  | 50%      | Medium   |
Row 5: | Ship Build   | FALSE| Ships    | Not started  | 0%       | Low      |
...    | ...          | ...  | ...      | ...          | ...      | ...      |
Row 23:| Final Task   | FALSE| Other    | Waiting      | 0%       | High     |
```

## Important Notes

### Column B (Checkbox Column)
- Should contain either:
  - Checkbox cells (inserted via Insert > Checkbox in Google Sheets)
  - TRUE/FALSE values (text)
  - "1" or "0" (numeric)
- The app will toggle these values when you click checkboxes

### Data Rows (3-23)
- Keep data within columns A through F
- Don't leave entire rows completely empty if you want them to display
- The app filters out completely empty rows automatically

### Headers
- **Best practice**: Put headers in Row 1
- Row 2 can be empty or used for formatting
- Headers help identify what each column represents

## Quick Setup Steps

1. **Open your Google Sheet**

2. **Row 1 - Add Headers:**
   - A1: Put your first column header (e.g., "Task Name")
   - B1: Put "Status" or "Done" (this is the checkbox column)
   - C1-F1: Add headers for remaining columns

3. **Row 2:**
   - Leave empty OR add sub-headers if needed

4. **Rows 3-23:**
   - Add your data starting from row 3
   - Column B: Use checkboxes or TRUE/FALSE values
   - Fill other columns as needed

5. **Format Column B as Checkboxes (Optional but Recommended):**
   - Select column B (click the column header)
   - Go to: Insert > Checkbox
   - This makes it easier to manage in Google Sheets

## Common Issues to Avoid

❌ **Don't:**
- Put headers in random rows
- Mix data and headers
- Leave row 2 with important headers if row 1 is empty
- Use merged cells in rows 1-2 (can cause issues)
- Put data outside columns A-F if you want it displayed

✅ **Do:**
- Keep headers in row 1 (or row 2 if row 1 is used for something else)
- Keep data organized starting from row 3
- Use consistent formatting
- Keep checkbox column (B) as checkboxes or TRUE/FALSE

## Current App Configuration

The app is currently set to:
- **Sheet Tab Name:** "Overview"
- **Headers:** Tries row 1, then row 2
- **Data Range:** Rows 3-23, Columns A-F
- **Checkbox Column:** Column B

If you want to change these settings, edit the constants at the top of `app.js`:
```javascript
const SHEET_NAME = 'Overview';        // Change sheet tab name
const DATA_RANGE = 'A3:F23';         // Change data range
const CHECKBOX_COLUMN_INDEX = 1;     // Column B (0=A, 1=B, 2=C, etc.)
```


