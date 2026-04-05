import shutil, os
src = r'C:\Users\user\Downloads\HealthCenter.jsx'
dst = r'C:\Users\user\Documents\telemed-connect\src\pages\HealthCenter.jsx'
shutil.copy2(src, dst)
print('Copied!' if os.path.exists(dst) else 'Failed!')