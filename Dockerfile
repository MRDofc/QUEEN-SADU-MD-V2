# 1. Base image එක
FROM node:lts-buster

# 2. අවශ්‍ය dependencies install කිරීම
# pm2 එක npm start එකේදී පාවිච්චි කරන නිසා, එය මෙතනම Global install කරන්න
RUN npm install -g pm2

# 3. Code එක clone කිරීම (මෙය /QUEEN-SADU-MD-V2 ෆෝල්ඩරය සාදයි)
RUN git clone https://github.com/MRDofc/QUEEN-SADU-MD-V2

# 4. වැඩ කරන Directory එක නිවැරදි ෆෝල්ඩරයට වෙනස් කිරීම
WORKDIR /QUEEN-SADU-MD-V2

# 5. dependencies ස්ථාපනය කිරීම
# කලින් වගේ && පාවිච්චි නොකර, npm install එක අසාර්ථක වුවත් yarn install එක ක්‍රියාත්මක වීමට || පාවිච්චි කරන්න.
RUN npm install || yarn install

# 6. Local files (ඔබේ .env වගේ files) image එකට copy කිරීම
# ඔබ QUEEN-SADU-MD-V2 ෆෝල්ඩරය තුළ සිටින නිසා, COPY . . මගින් ඒ folder එක ඇතුළට files copy වේ.
COPY . .

# 7. Port එක expose කිරීම (9090 Port එක පාවිච්චි කරන්නේ නම්)
EXPOSE 9090

# 8. Container එක ආරම්භ කරන Command එක
# මෙය සාමාන්‍යයෙන් package.json හි ඇති "start" script එක ක්‍රියාත්මක කරයි (එහි pm2 command එක තිබිය යුතුයි).
CMD ["npm", "start"]
