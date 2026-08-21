const { withAndroidStyles, withDangerousMod, AndroidConfig } = require('expo/config-plugins');
const fs = require('node:fs/promises');
const path = require('node:path');

const APP_THEME_PARENT = 'Theme.AppCompat.DayNight.NoActionBar';

/**
 * ライト／ダークそれぞれのシステムバーアイコン色を Android テーマに書く。
 * @description prebuild で styles.xml が作り直されても、時計が余白と同色で消えないようにする。
 */
function withAndroidSystemBars(config) {
  config = withAndroidStyles(config, (mod) => {
    const parent = AndroidConfig.Styles.getAppThemeGroup();
    let styles = mod.modResults;
    styles = AndroidConfig.Styles.assignStylesValue(styles, {
      add: true,
      parent,
      name: 'android:windowLightStatusBar',
      value: 'true',
      targetApi: '23',
    });
    styles = AndroidConfig.Styles.assignStylesValue(styles, {
      add: true,
      parent,
      name: 'android:windowLightNavigationBar',
      value: 'true',
      targetApi: '27',
    });
    mod.modResults = styles;
    return mod;
  });

  return withDangerousMod(config, [
    'android',
    async (mod) => {
      const nightDir = path.join(
        mod.modRequest.platformProjectRoot,
        'app/src/main/res/values-night'
      );
      await fs.mkdir(nightDir, { recursive: true });
      await fs.writeFile(
        path.join(nightDir, 'styles.xml'),
        `<?xml version="1.0" encoding="utf-8"?>
<resources xmlns:tools="http://schemas.android.com/tools">
  <style name="AppTheme" parent="${APP_THEME_PARENT}">
    <item name="android:editTextBackground">@drawable/rn_edit_text_material</item>
    <item name="colorPrimary">@color/colorPrimary</item>
    <item name="android:statusBarColor">@android:color/transparent</item>
    <item name="android:navigationBarColor">@android:color/transparent</item>
    <item name="android:windowLightStatusBar" tools:targetApi="23">false</item>
    <item name="android:windowLightNavigationBar" tools:targetApi="27">false</item>
  </style>
</resources>
`
      );
      return mod;
    },
  ]);
}

module.exports = withAndroidSystemBars;
