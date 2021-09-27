package com.example.reactnativemusoratemplates;

import android.app.Application;
import android.content.Context;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.ReactInstanceManager;
import com.facebook.soloader.SoLoader;
import java.lang.reflect.InvocationTargetException;
import java.util.List;

import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.th3rdwave.safeareacontext.SafeAreaContextPackage;
import com.oblador.keychain.KeychainPackage;
import com.horcrux.svg.SvgPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import org.wonday.orientation.OrientationPackage;
import org.wonday.orientation.OrientationActivityLifecycle;
import com.vonovak.AddCalendarEventPackage;
import com.imagepicker.ImagePickerPackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.swmansion.reanimated.ReanimatedPackage;
import com.swmansion.rnscreens.RNScreensPackage;
import com.rumax.reactnative.pdfviewer.PDFViewPackage;
import com.reactnativerate.RNRatePackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
          // Packages that cannot be autolinked yet can be added manually here, for MusoraTemplatesExample:
          packages.add(new AsyncStoragePackage());
          packages.add(new SafeAreaContextPackage());
          packages.add(new KeychainPackage());
          packages.add(new SvgPackage());
          packages.add(new RNDeviceInfo());
          packages.add(new OrientationPackage());
          packages.add(new AddCalendarEventPackage());
          packages.add(new ImagePickerPackage());
          packages.add(new PickerPackage());
          packages.add(new ReanimatedPackage());
          packages.add(new RNScreensPackage());
          packages.add(new RNGestureHandlerPackage());
          packages.add(new PDFViewPackage());
          packages.add(new RNRatePackage());
          packages.add(new RNCWebViewPackage());
          
          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    initializeFlipper(this, getReactNativeHost().getReactInstanceManager()); // Remove this line if you don't want Flipper enabled
    registerActivityLifecycleCallbacks(OrientationActivityLifecycle.getInstance());
  }

  /**
   * Loads Flipper in React Native templates.
   *
   * @param context
   */
  private static void initializeFlipper(Context context, ReactInstanceManager reactInstanceManager) {
    if (BuildConfig.DEBUG) {
      try {
        /*
         We use reflection here to pick up the class that initializes Flipper,
        since Flipper library is not available in release mode
        */
        Class<?> aClass = Class.forName("com.reactnativemusoratemplatesExample.ReactNativeFlipper");
        aClass
            .getMethod("initializeFlipper", Context.class, ReactInstanceManager.class)
            .invoke(null, context, reactInstanceManager);
      } catch (ClassNotFoundException e) {
        e.printStackTrace();
      } catch (NoSuchMethodException e) {
        e.printStackTrace();
      } catch (IllegalAccessException e) {
        e.printStackTrace();
      } catch (InvocationTargetException e) {
        e.printStackTrace();
      }
    }
  }
}
