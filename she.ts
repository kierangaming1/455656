import '../utils/string.extensions'

const mysql = require('mysql2');

const { query } = require('mysql2/promise');

import config from '../config'
const connection = mysql.createConnection({
  host: '',
  user: '',
  password: '',
  database: ''
});

connection.connect(function(err: any) {
  if (err) throw err;
  console.log('Connected to MySQL database.');
});
//.

import Discord, { Message } from 'discord.js'
import { Client, Collection, Intents, MessageEmbed} from 'discord.js'
import path from 'path'
import { readdirSync } from 'fs'
import { Command, Event, Config } from '../interfaces'
const discordModals = require('discord-modals')
const { format, parse } = require('date-and-time')


const { GoogleSpreadsheet } = require('google-spreadsheet');
const doc = new GoogleSpreadsheet('1YJWvQVYTBxeT56DVJ2oV3Rm9zmBcTHu690s7VVabMkw');


let currentDate = new Date().toJSON().slice(0, 10);
console.log(currentDate);



export default class InfernoClient extends Client {
  public commands: Collection<string, Command> = new Collection()
  public events: Collection<string, Event> = new Collection()
  public aliases: Collection<string, Command> = new Collection()

  public constructor() {
    super({
      intents: [
        [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_MESSAGES],
      ],
      presence: {
        status: 'online',
        activities: [{ name: '/apply /reapply', type: 'WATCHING' }],
      },
      partials: ['MESSAGE', 'REACTION', 'CHANNEL'],
    })
  }

  public async init() {
    /* Commands */
    const commandPath = path.join(__dirname, '..', 'commands')
    readdirSync(commandPath).forEach((dir) => {
      const commands = readdirSync(`${commandPath}/${dir}`).filter((file) => file.endsWith('.ts'))

      for (const file of commands) {
        const { command } = require(`${commandPath}/${dir}/${file}`)
        this.commands.set(command.data.name, command)
      }
    })

    /* Events */
    const eventPath = path.join(__dirname, '..', 'events')
    readdirSync(eventPath).forEach(async (file) => {
      const { event } = await import(`${eventPath}/${file}`)
      this.events.set(event.name, event)
      this.on(event.name, event.run.bind(null, this))
    })

    this.login(config.BOT_TOKEN)
    discordModals(this)
    /*Sheets */
    doc.useServiceAccountAuth(require('./service_account.json')).then(async () => {
      console.log('Spreadsheet is loaded');
      await doc.loadInfo(); // Load metadata about the document
      const sheet = doc.sheetsByIndex[0]; // Access the Second sheet of the document you cab change this to your sheet layout [0,1,2,3,.....]
        // Get all rows from the sheet
        const rows = await sheet.getRows();
        //console.log(rows);



    
    this.on('modalSubmit', async (modal) => {
      if (modal.customId === 'reapplication') {
      const logs = this.channels.cache.get(config.APPLICATIONS_LOG_CHANNEL) as Discord.TextChannel
      if (!logs) return console.log('Cannot find log channel')
      const Name1 = modal.getTextInputValue('Name1' + modal.user.id)
      const Steam = modal.getTextInputValue('Steam64' + modal.user.id)
      const Forum = modal.getTextInputValue('Forums' + modal.user.id)
      const region = modal.getTextInputValue('region' + modal.user.id)
      const Rank = modal.getTextInputValue('Rank' + modal.user.id)
      console.log(modal)
      //if you added more questions, you can add them answers here license
      modal.reply({ content:'Thank you for showing your interest in vantage! We will keep you updated on this interest form.'});
      let result: string = `**${modal.user.tag}**\n\n**Name:** ${Name1}\n**Steam 64?:** ${Steam}\n**Forums?:** ${Forum}\n**What is your regoin/Timezone:** ${region}\n**What was your rank before the wipe?:** ${Rank}\n**---Re Apply Completed---**`
      console.log(format(new Date(), 'YYYY/MM/DD HH:mm') + result.replaceAll('**', ' '))
      console.log('-----------------------------------------------------')
      if (result.length > 2040) {
        result =
          'The application is too long to be displayed in the embed, please check the bot logs.'
        console.log('^^^^ Cannot send embed, sending text to console instead ^^^^')
        console.log('-----------------------------------------------------')
      }
      
      const embed = new MessageEmbed()
        .setTitle('Vantage Towing Reapply ' + modal.user.tag)
        .setDescription(result)
        .setTimestamp()
        .setThumbnail('https://i.imgur.com/r3BXB8S.png')
        .setFooter({ text: 'Made by Kieran Smith' })

      logs.send( { embeds: [embed] })
      const ping = this.channels.cache.get('991678163518238810') as Discord.TextChannel
      //ping.send('<@&963903090057154570>')
     }
     else if (modal.customId === 'denied') {
      const logs = this.channels.cache.get(config.HRAPPLICATIONS_LOG_CHANNEL) as Discord.TextChannel;
      if (!logs) return console.log('Cannot find log channel');
      const answer1 = modal.getTextInputValue('uid' + modal.user.id);
      const answer2 = modal.getTextInputValue('Reason' + modal.user.id);
     
           console.log(`Elements: ${currentDate}, ${answer1}, ${answer2}`);
           connection.query(
             'UPDATE applications SET Reason = ?, status = "denied", log = ? WHERE id = ?', [answer2, modal.user.id, answer1],
             function(error: any, results: any, fields: any) {
               if (error) throw error;
               console.log('Reason, status, and logged_by updated in the MySQL database.');
     

     
         // Build the embed and send it to the log channel
         let result = `**Application denied**\n\n**Unique ID:** ${answer1}\n**Reason?:** ${answer2}\n by ${modal.user.tag}`;
         modal.reply({ content: 'Okay done.'});
         console.log(format(new Date(), 'YYYY/MM/DD HH:mm') + result.replaceAll('**', ' '));
         console.log('-----------------------------------------------------');
         if (result.length > 2040) {
           result = 'The application is too long to be displayed in the embed, please check the bot logs.';
           console.log('^^^^ Cannot send embed, sending text to console instead ^^^^');
           console.log('-----------------------------------------------------');
         }
         const embed = new MessageEmbed()
         .setTitle('Vantage Towing Application ')
         .setDescription(result)
         .setTimestamp()
         .setThumbnail('https://i.imgur.com/1SVP9cI.png')
         .setFooter({ text: 'Made by Kieran Smith' })

     
         logs.send( { embeds: [embed] });
        }
        );
        }
        else if (modal.customId === 'accept') {
          const logs = this.channels.cache.get(config.HRAPPLICATIONS_LOG_CHANNEL) as Discord.TextChannel;
          if (!logs) return console.log('Cannot find log channel');
          const answer1 = modal.getTextInputValue('uid' + modal.user.id);
         
               console.log(`Elements: ${currentDate}, ${answer1}`);
               connection.query(
                 'UPDATE applications SET status = "accepted", log = ? WHERE id = ?', [ modal.user.id, answer1],
                 function(error: any, results: any, fields: any) {
                   if (error) throw error;
                   console.log('Reason, status, and logged_by updated in the MySQL database.');
         
    
         
             // Build the embed and send it to the log channel
             let result = `**Application Accepted**\n\n**Unique ID:** ${answer1}\n by ${modal.user.tag}`;
             modal.reply({ content: 'Okay done.'});
             console.log(format(new Date(), 'YYYY/MM/DD HH:mm') + result.replaceAll('**', ' '));
             console.log('-----------------------------------------------------');
             if (result.length > 2040) {
               result = 'The application is too long to be displayed in the embed, please check the bot logs.';
               console.log('^^^^ Cannot send embed, sending text to console instead ^^^^');
               console.log('-----------------------------------------------------');
             }
             const embed = new MessageEmbed()
             .setTitle('Vantage Towing Application ')
             .setDescription(result)
             .setTimestamp()
             .setThumbnail('https://i.imgur.com/2czCGql.png')
             .setFooter({ text: 'Made by Kieran Smith' })
    
         
             logs.send( { embeds: [embed] });
            }
            );
            }
            else if (modal.customId === 'hold') {
              const logs = this.channels.cache.get(config.HRAPPLICATIONS_LOG_CHANNEL) as Discord.TextChannel;
              if (!logs) return console.log('Cannot find log channel');
              const answer1 = modal.getTextInputValue('uid' + modal.user.id);
              const answer2 = modal.getTextInputValue('Reason' + modal.user.id);
             
                   console.log(`Elements: ${currentDate}, ${answer1}, ${answer2}`);
                   connection.query(
                     'UPDATE applications SET Reason = ?, status = "hold", log = ? WHERE id = ?', [answer2, modal.user.id, answer1],
                     function(error: any, results: any, fields: any) {
                       if (error) throw error;
                       console.log('Reason, status, and logged_by updated in the MySQL database.');
             
        
             
                 // Build the embed and send it to the log channel
                 let result = `**Application On-Hold**\n\n**Unique ID:** ${answer1}\n**Reason?:** ${answer2}\n by ${modal.user.tag}`;
                 modal.reply({ content: 'Okay done.'});
                 console.log(format(new Date(), 'YYYY/MM/DD HH:mm') + result.replaceAll('**', ' '));
                 console.log('-----------------------------------------------------');
                 if (result.length > 2040) {
                   result = 'The application is too long to be displayed in the embed, please check the bot logs.';
                   console.log('^^^^ Cannot send embed, sending text to console instead ^^^^');
                   console.log('-----------------------------------------------------');
                 }
                 const embed = new MessageEmbed()
                 .setTitle('Vantage Towing Application ')
                 .setDescription(result)
                 .setTimestamp()
                 .setThumbnail('https://i.imgur.com/3FG65UI.png')
                 .setFooter({ text: 'Made by Kieran Smith' })
        
             
                 logs.send( { embeds: [embed] });
                }
                );
                }
     else if (modal.customId === 'application') {
      const logs = this.channels.cache.get(config.APPLICATIONS_LOG_CHANNEL) as Discord.TextChannel;
      if (!logs) return console.log('Cannot find log channel');
      const answer1 = modal.getTextInputValue('Name' + modal.user.id);
      const answer2 = modal.getTextInputValue('Citizen' + modal.user.id);
      const answer3 = modal.getTextInputValue('CleanDriving' + modal.user.id);
      const answer4 = modal.getTextInputValue('Join' + modal.user.id);
      const answer5 = modal.getTextInputValue('ForUs' + modal.user.id);
      //console.log(modal);
      const sheet = doc.sheetsByIndex[2];
      await sheet.addRow({
        Date: currentDate,
        Name: answer1,
        DiscordID: modal.user.id,
        Citizen: answer2,
        CleanDriving: answer3,
        Join: answer4,
        ForUs: answer5,
        ApplicationStatus: "Pending"
      });
      console.log(`Elements: ${currentDate}, ${answer1}, ${answer2},${answer3},${answer4},${answer5}`);
      connection.query(
        'INSERT INTO applications (discord, status, apptype, name, citizen, clean_driving, `join`, for_us, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [modal.user.id, 'pending', 'Towoperator', answer1, answer2, answer3, answer4, answer5, currentDate],
        function(error: any, results: any, fields: any) {
          if (error) throw error;
          console.log('Application added to the MySQL database.');
      
          // Retrieve the value of the auto-incremented column
          const uniqueId = results.insertId;
      
          // Build the embed and send it to the log channel
          let result = `**${modal.user.tag}**\n\n**Name:** ${answer1}\n**Are you a citizen of Florida?:** ${answer2}\n**Do you have a clean driving record?:** ${answer3}\n**Why do you want a job at Vantage?:** ${answer4}\n**Why are you the best candidate for us?:** ${answer5}`;
          modal.reply({ content: 'Thank you for your application! We will review it as soon as possible. ***Your unique application ID is:'+` ${uniqueId}'***` });
          console.log(format(new Date(), 'YYYY/MM/DD HH:mm') + result.replaceAll('**', ' '));
          console.log('-----------------------------------------------------');
          if (result.length > 2040) {
            result = 'The application is too long to be displayed in the embed, please check the bot logs.';
            console.log('^^^^ Cannot send embed, sending text to console instead ^^^^');
            console.log('-----------------------------------------------------');
          }
          const uid = uniqueId.toString();
          const embed = new MessageEmbed()
          .setTitle('Vantage Towing Application ' + modal.user.tag)
          .setDescription(result)
          .setTimestamp()
          .setThumbnail('https://i.imgur.com/KVoUp3y.png')
          .setFooter({ text: 'Made by Kieran Smith' })
          .addFields({
            name: 'UniqueId',
            value: uniqueId.toString()
          });
      
          logs.send( { embeds: [embed] });
        }
      );

    const ping = this.channels.cache.get('991678163518238810') as Discord.TextChannel
    ping.send('<@&963903090057154570>')
    }  
      
    else if (modal.customId === 'volunteers') {
     const logs = this.channels.cache.get(config.APPLICATIONS_LOG_CHANNEL) as Discord.TextChannel
     if (!logs) return console.log('Cannot find log channel')
     const answer1 = modal.getTextInputValue('Name1' + modal.user.id)
     const answer2 = modal.getTextInputValue('Steam64' + modal.user.id)
     const answer3 = modal.getTextInputValue('Forums' + modal.user.id)
     const answer4 = modal.getTextInputValue('Faction' + modal.user.id)
     const answer5 = modal.getTextInputValue('why' + modal.user.id)
     console.log(modal)
     const sheet = doc.sheetsByIndex[1];
		  await sheet.addRow({ Date:currentDate, Name: answer1,Discordus:modal.user.tag, Steam64: answer2, Forums: answer3, Faction: answer4, why: answer5}); //\Name,ADV,Res are just names for the heading of your googlesheet columns
      connection.query(
        'INSERT INTO applications (discord, status, apptype, name, citizen, clean_driving, `join`, for_us, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [modal.user.id, 'accepted', 'Volunteer', answer1, answer2, answer3, answer4, answer5, currentDate],
        function(error: any, results: any, fields: any) {
          if (error) throw error;
          console.log('Application added to the MySQL database.');
      
          // Retrieve the value of the auto-incremented column
          const uniqueId = results.insertId;
          
      //if you added more questions, you can add them answers here license
     modal.reply({ content:'Thank you for your application! We will review it as soon as possible. ***Your unique application ID is:'+` ${uniqueId}***`});
     let result: string = `**${modal.user.tag}**\n\n**Name:** ${answer1}\n**Steam 64?:** ${answer2}\n**Forums?:** ${answer3}\n**What Faction volunteering from?:** ${answer4}\n**Why would you like to volunteer?:** ${answer5}`
     console.log(format(new Date(), 'YYYY/MM/DD HH:mm') + result.replaceAll('**', ' '))
     console.log('-----------------------------------------------------')
     if (result.length > 2040) {
       result =
         'The application is too long to be displayed in the embed, please check the bot logs.'
       console.log('^^^^ Cannot send embed, sending text to console instead ^^^^')
       console.log('-----------------------------------------------------')
     }
     
     const embed = new MessageEmbed()
       .setTitle('Vantage Towing Volunteer Application ' + modal.user.tag)
       .setDescription(result)
       .setTimestamp()
       .setThumbnail('https://i.imgur.com/Ax8ox5H.png')
       .setFooter({ text: 'Made by Kieran Smith' })
       .addFields({
        name: 'UniqueId',
        value: uniqueId.toString()
      });
      
     //console.log(embed)
     logs.send( { embeds: [embed] })
    }
    );
     const ping = this.channels.cache.get('991678163518238810') as Discord.TextChannel
     ping.send('<@&963903090057154570>')
    }
    else if (modal.customId === 'check') {
      const answer1 = modal.getTextInputValue('APPID' + modal.user.id);
  
      console.log(`Elements: ${currentDate}, ${answer1}`);
      

      checkApplicationStatus(answer1)
      .then(response => {
      modal.reply(response);
      })
      .catch(error => {
      console.error(error);
      modal.reply('An error occurred while checking your application status. Please try again later.');
      });
    }
  });
  
  async function checkApplicationStatus(answer1: any) {
    let response;
  
    try {
    const applicationStatus = await getApplicationStatus(answer1);
  
    if (applicationStatus === "accepted") {
      async function getApplicantInfo(applicantId: number) {
        try {
          const [rows, fields] = await connection.promise().query('SELECT name, discord FROM applications WHERE id = ?', [applicantId]);
          return rows[0];
        } catch (error) {
          console.error(error);
          return null;
        }
      }
      
      const applicantInfo = await getApplicantInfo(answer1);
      const embed = new MessageEmbed()
      .setColor(0x57F287)
      .setTitle('Status')
      .setThumbnail('https://i.imgur.com/2czCGql.png')
      .addFields(
        {name: 'Application ID', value: answer1},
        { name: 'Lets see your application was', value: 'ACCEPTED' },
        { name: 'Yay!!!', value: `Congrats, ${applicantInfo.name}`},
        { name: '\u200B', value: '\u200B' },
        { name: 'Not recived a response?', value: 'Please create a HR new higher ticket and quote your application number', inline: true },
        { name: 'Received a response and not sure what to do?' , value: 'Please create a HR new higher ticket'}
      )
     //console.log(embed)
     response = ( { embeds: [embed] })
      //response = "Your application has been accepted. You'll receive a response from HR shortly regarding the next steps in the application process.";
    } else if (applicationStatus === "denied") {

      async function getDenialReason(answer1: any) {
        try {
          const [rows, fields] = await connection.promise().query('SELECT reason FROM applications WHERE id = ?', [answer1]);
          return rows[0].reason;
        } catch (error) {
          console.error(error);
          return null;
        }
        }

        async function getApplicantInfo(applicantId: number) {
          try {
            const [rows, fields] = await connection.promise().query('SELECT name, discord FROM applications WHERE id = ?', [applicantId]);
            return rows[0];
          } catch (error) {
            console.error(error);
            return null;
          }
        }
        
        const applicantInfo = await getApplicantInfo(answer1);
        const denialReason = await getDenialReason(answer1);
        
        const embed = new MessageEmbed()
          .setColor(0xED4245)
          .setThumbnail('https://i.imgur.com/1SVP9cI.png')
          .setTitle('Status')
          .addFields(
            { name: 'Application ID', value: answer1 },
            { name: 'Lets see, your application was', value: 'DENIED' },
            { name: 'Reason', value: denialReason || 'We do not specify the reason over the bot' },
            { name: 'Next Step', value: 'Unfortunately your application was denied. Please submit a new application in 5 days.', inline: true }
          );
        
        response = { embeds: [embed] };
        

    }else if (applicationStatus === "hold") {

      async function getHoldReason(answer1: any) {
        try {
          const [rows, fields] = await connection.promise().query('SELECT reason FROM applications WHERE id = ?', [answer1]);
          return rows[0].reason;
        } catch (error) {
          console.error(error);
          return null;
        }
        }

        async function getApplicantInfo(applicantId: number) {
          try {
            const [rows, fields] = await connection.promise().query('SELECT name, discord FROM applications WHERE id = ?', [applicantId]);
            return rows[0];
          } catch (error) {
            console.error(error);
            return null;
          }
        }
        
        const applicantInfo = await getApplicantInfo(answer1);
        const holdReason = await getHoldReason(answer1);
        
        const embed = new MessageEmbed()
          .setColor(0xffea00)
          .setThumbnail('https://i.imgur.com/3FG65UI.png')
          .setTitle('Status')
          .addFields(
            { name: 'Application ID', value: answer1 },
            { name: 'Lets see, your application is currently', value: 'On Hold' },
            { name: 'Reason', value: holdReason || 'We do not specify the reason over the bot' },
            { name: 'Next Step', value: 'Unfortunately your application is on hold, this is good news HR has looked at it, mostlikely the roster is full.', inline: true }
          );
        
        response = { embeds: [embed] };
        

    }
    
    
    else if (applicationStatus === "pending") {
      async function getApplicantInfo(applicantId: number) {
        try {
          const [rows, fields] = await connection.promise().query('SELECT name, discord FROM applications WHERE id = ?', [applicantId]);
          return rows[0];
        } catch (error) {
          console.error(error);
          return null;
        }
      }
      const applicantInfo = await getApplicantInfo(answer1);
      const embed = new MessageEmbed()
      .setColor(0xFFFF00)
      .setTitle('Status')
      .setThumbnail('https://i.imgur.com/D5IBrWx.png')
      .addFields(
        { name: 'Application ID', value: answer1},
        { name: 'Lets see your application is', value: 'Pending' },
        { name: 'Application made by', value: `<@${applicantInfo.discord}>` },
        { name: '\u200B', value: '\u200B' },
        { name: 'Sorry', value: 'Your application is still pending, if it has been more than 2 days please message a person from HR.', inline: true }
      )
       //console.log(embed)
       response = ( { embeds: [embed] })
    } 
    else {
      const embed = new MessageEmbed()
      .setColor(0xED4245)
      .setTitle('Status')
      .addFields(
        { name: 'Error', value: 'Your application status is unknown' },
        {name: 'Yikes', value: 'If this error continues please contact: <@263694962418384897>'}
      )
       //console.log(embed)
       response = ( { embeds: [embed] })
    }
    } catch (error) {
    console.error(error);
    response = "An error occurred while checking your application status. Please try again later.";
    }
  
    return response;
  }
  
  function getApplicationStatus(applicationID: any) {
    return new Promise((resolve, reject) => {
    // Query the MySQL database to get the application status using the given application ID
    connection.query(
      'SELECT status FROM applications WHERE id = ?',
      [applicationID],
      function(error: any, results: string | any[], fields: any) {
      if (error) return reject(error);
  
      if (results.length === 0) {
        return reject(new Error('Application not found.'));
      }
  
      resolve(results[0].status);
    }
    );
    });
  }
})   

  }}