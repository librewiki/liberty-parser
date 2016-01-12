#-*- coding: utf-8 -*-
import sys, os, random
import logging, sys
import MySQLdb
import datetime, json, random, re, urllib
import httplib
from lxml import etree as et
from pyquery import PyQuery as pq
import StringIO
import hashlib
import datetime
reload(sys)
sys.setdefaultencoding('utf-8')
logging.basicConfig(stream=sys.stderr)
from flask import *
app = Flask(__name__)
def addslashes(s):
    d = {'"':'\\"', "'":"\\'", "\0":"\\\0", "\\":"\\\\"}
    return ''.join(d.get(c, c) for c in s)
@app.route("/")
def home_page():
    return render_template("wiki.html",title="대문",page_contents="")
@app.route("/wiki/<path:page_name>")
def wiki_page(page_name):
    need_request = False
#first check exist page in db.
    conn = MySQLdb.connect('127.0.0.1','wide_user','456456','db_mirror',use_unicode = True)
    cur = conn.cursor()
    qry = "SELECT * FROM tb_page WHERE title='{}' LIMIT 1".format(addslashes(page_name))
    row = None
    text = None
    if cur.execute(qry) == 0:
        need_request = True
    else:
        row = cur.fetchone()
    if !need_request:
        delta = datetime.datetime.now() - row[4]
        if delta.days >= 1 or delta.seconds > 5 * 60:
            need_request = True
        else:
            text = row[1]
#TODO:check revision
#TODO: get page
#TODO: update or insert page
#TODO: render page
    a= "<p>asd</p>"
    return render_template("wiki.html",title=page_name,page_contents=a)
def img_check(img_name):
#if image info exist in the db, just check revision. if not, get image url and revision
    return ""
@app.route("/libreimg/<path:img_name>")
def img_get_api(img_name):
#https://librewiki.net/
    url = "api.php?action=query&titles={}&prop=imageinfo&&iiprop=url&format=json"
    return ""
@app.route("/recent")
def recent_page():
    url = "/api.php?action=query&list=recentchanges&rcprop=title%7Ctimestamp&rcshow=!bot%7C!redirect&rctype=edit%7Cnew&rclimit=100&format=json&rcnamespace=0%7C4%7C10%7C12%7C14%7C1600&rctoponly="
    data = None
    delta = None
    need_request = False
    conn = MySQLdb.connect('127.0.0.1','wide_user','456456','db_mirror',use_unicode = True)
    cur = conn.cursor()
    cur.execute("SELECT text,recent_check FROM tb_page WHERE title='special:recent' LIMIT 1")
    print cur.rowcount
    if cur.rowcount == 0:
        need_request = True
    else:
        row = cur.fetchone()
        delta = datetime.datetime.now() - row[1]
        data = row[0]
        if delta.days > 1 or delta.seconds > 120 :
            need_request = True
    if need_request:
        httpConnection = httplib.HTTPSConnection("librewiki.net")
        httpConnection.request("GET",url)
        response = httpConnection.getresponse()
        if response.status != 200 and data is None:
            print response.reason
            return render_template("wiki.html",title="최근바뀜",page_contents="<h1>얻어오기 실패</h1>")
        elif response.status == 200:
            data = response.read()
            qry = "UPDATE tb_page SET text = \"{}\", recent_check=NOW() WHERE title='special:recent'"
            if cur.rowcount == 0:
                qry = "INSERT INTO tb_page (text,title,revision) VALUES (\"{}\",'special:recent',1)"
            cur.execute(qry.format(addslashes(data)))
        
    recent_parse = json.loads(data)
    conn.commit()
    conn.close()
    recent_list= recent_parse["query"]["recentchanges"]
    html = StringIO.StringIO()
    html.write("<table class='recent-table'><tbody>")
    html.write("<tr><th>항목</th><th>시간</th></tr>")
    for item in recent_list:
        html.write("<tr>")
        html.write("<td><a href='/wiki/")
        html.write(urllib.quote(item["title"].encode("utf8")))
        html.write("'>")
        html.write(item["title"])
        html.write("</a></td>")
        html.write("<td>")
        html.write(item["timestamp"])
        html.write("</td>")
        html.write("</tr>")
    html.write("</tbody></table>")
    return render_template("wiki.html",title="특수:최근바뀜",page_contents=html.getvalue())
@app.route("/js/<path:jsfile>")    
def js_file(jsfile):
	fp = open("/var/www/host/pyTest_beta/js/{}".format(jsfile))
	return send_file(fp)
@app.route("/css/<path:cssfile>")    
def css_file(cssfile):
    fp = open("/var/www/host/pyTest_beta/css/{}".format(cssfile))
    return send_file(fp)

if __name__ == "__name__":
	app.run(host="0.0.0.0", port=18467,debug=True)
