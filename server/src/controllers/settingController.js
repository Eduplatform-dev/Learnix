import Setting from "../models/Setting.js";

/* ================= GET SETTINGS ================= */

export const getSettings = async (req, res) => {
try {

```
let settings = await Setting.findOne();

if (!settings) {
  settings = await Setting.create({});
}

res.json(settings);
```

} catch (err) {

```
res.status(500).json({ error: "Server error" });
```

}
};

/* ================= UPDATE SETTINGS ================= */

export const updateSettings = async (req, res) => {
try {

```
let settings = await Setting.findOne();

if (!settings) {
  settings = await Setting.create({});
}

Object.assign(settings, req.body);

await settings.save();

res.json(settings);
```

} catch (err) {

```
res.status(500).json({ error: "Server error" });
```

}
};
