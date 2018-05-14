from socketIO_client import SocketIO
import time
import mysql.connector
import ast

## Connection a la base de donnee
cnx = mysql.connector.connect(user='root', password='',host='127.0.0.1',database='logger')
cursor = cnx.cursor()

## Deleguees
def on_connect():
	print('connect')
	
def on_disconnect():
	print('disconnect')
	
def on_reconnect():
	print('reconnect')

## Code execute lorsqu'on a une nouvelle connection
def nouveau_client(*args):
	user = ''.join(args)
	user[user.find('\'') : user.rfind('\'')]
	cursor.execute("Insert Into logger(Username, Type, Timestamp) Values ('" + user + "', 'Login', now())")
	cnx.commit()
	print("new client")

## Code execute lorsqu'on a un nouveau message
def nouveau_message(*args):
	chaine = str(args)
	chaine = chaine[1 : len(chaine) - 2]
	a = ast.literal_eval(chaine)
	cursor.execute("Insert Into loggermsg(Username, Message, Timestamp) Values ('" + a['pseudo'] + "', '" + a['message'] + "' , now());")
	print(a['pseudo'] + ": " + a['message'])
	cnx.commit()
	

## 'main'
socketIO = SocketIO('localhost', 8080)
socketIO.on('connect', on_connect)
socketIO.on('disconnect', on_disconnect)
socketIO.on('reconnect', on_reconnect)
socketIO.on('nouveau_client', nouveau_client)
socketIO.on('nouveau_message', nouveau_message)

## Loop principal
socketIO.wait()

## On fait le menage
cursor.close()
cnx.close()