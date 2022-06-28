/*
 * Upon submission, this file should contain the SQL script to initialize your database.
 * It should contain all DROP TABLE and CREATE TABLE statments, and any INSERT statements
 * required.
 */
drop table if exists notifications;
drop table if exists subscribe;
drop table if exists user_like_record;
drop table if exists comments;
drop table if exists articles;
drop table if exists user_accounts;

create table if not exists user_accounts(
    id integer unique not null PRIMARY Key,
    username varchar(32) unique not null ,
	password varchar(32) not null,
	firstName varchar(32) not null,
	lastName varchar(32) not null,
	date_of_birth date not null,
	description varchar(100) ,
	avatar varchar(32) not null,
	authtoken varchar(128),
	number_of_likes integer,
	admin integer default 0
);

create table if not exists articles
(
    article_id integer not null primary key,
    article varchar(21845) not null,
    title varchar(50) not null,
	article_create_date datetime not null,
	author integer not null,
	author_id integer not null,
	number_of_likes integer default 0,
	number_of_comments integer default 0,
	popularity integer default 0,
	image varchar(32),
	FOREIGN KEY (author) REFERENCES user_accounts(username) on update cascade,
	FOREIGN KEY (author_id) REFERENCES user_accounts(id) on delete cascade
);

create table if not exists comments
(
    comment_id integer not null primary key,
    comment varchar(21845) not null,
	comment_date datetime not null,
	username_id integer not null,
	article_id integer not null,
	parent_comment_id integer,
	FOREIGN KEY (parent_comment_id) REFERENCES comments(comment_id),
	FOREIGN KEY (username_id) REFERENCES user_accounts(id) on update cascade,
	FOREIGN KEY (article_id) REFERENCES articles(article_id) on delete cascade
);

create table if not exists user_like_record
(

	user_id integer not null,
	a_id integer not null,
	PRIMARY KEY (user_id, a_id),
	FOREIGN KEY (user_id) REFERENCES user_accounts(id) on delete cascade on update cascade,
	FOREIGN KEY (a_id) REFERENCES articles(article_id) on delete cascade on update cascade

);

create table if not exists subscribe
(
	subscriber_id integer not null,
	publisher_id integer not null,
	PRIMARY KEY (subscriber_id, publisher_id),
	FOREIGN KEY (subscriber_id) REFERENCES user_accounts(id) on delete cascade,
	FOREIGN KEY (publisher_id) REFERENCES user_accounts(id) on delete cascade

);

create table if not exists notifications (
	notification_id integer not null primary key,
	subscriber_id integer not null,
	link varchar(21845) not null,
	notification varchar(21845) not null,
	read int default 0,
	date_of_notification datetime not null,
	publisher_avatar varchar(21845) not null,
	foreign key (subscriber_id) references user_accounts(id) on delete cascade
);

INSERT INTO user_accounts(id, username, password, firstname, lastname, date_of_birth, description, avatar) VALUES
    (2, "unknown", "1", "1", "1", "1969-4-20", "Eat all your comments", "eevee"),
	(3, "test", "$2b$10$EDxvkBGxhA3saRWtoCbBo.XHO2WY6kTyVdgBnA.iMQF6/AX5nyIvm", "test", "account", "1987-07-18", "test account", "charmander"),
	(4, "testtwo", "$2b$10$OPCt/bc9G2g3BJsNuEfZ5.Bxq8JSDbe7XzFor9fnrxbimV/FvBnHe", "test", "two", "2003-06-21", "test account number 2", "eevee");

INSERT INTO user_accounts(id, username, password, firstname, lastname, date_of_birth, description, avatar, admin) VALUES
    (1, "adminAccount", "$2b$10$juF4cE9cXk26ZG90f.7p4ObN8/rst/ZHHUnHSkTMXaV7wwrI7LVvq", "admin", "admin", "0000-00-00", "admin", "pikachu", 1);


INSERT INTO articles(article_id, article, title, article_create_date, author, author_id, number_of_likes, number_of_comments, popularity, image) VALUES
	(1, "<p>Following in the animated footsteps of &ldquo;The Simpsons Movie&rdquo; and &ldquo;South Park: Bigger, Longer, and Uncut,&rdquo; the Belchers make the leap this week to the big screen in &ldquo;The Bob&rsquo;s Burgers Movie,&rdquo; a delightful little romp that should appeal mostly to fans of the show, even if hardcore devotees might feel like there are a few 4-5-episode runs of the series that are stronger than this film. On the fresh side of the bun, &ldquo;The Bob&rsquo;s Burgers Movie&rdquo; is briskly plotted and nails the big heart and wonderful characters of the beloved FOX show. On the stale side, it lacks a little in the ambition department, setting up an interesting tale of various issues of doubt within the members of the Belcher clan only to not do much with that set-up until a rushed finale. But it&rsquo;s never boring, and it&rsquo;s smarter than most pop culture-obsessed children&rsquo;s entertainment. Anything that brings the joy of loving &ldquo;Bob&rsquo;s Burgers&rdquo; to a wider audience is a good thing, even if I mostly hope this does well enough to guarantee a bigger and better sequel.</p>", "The Bob's Burgers Movie Review", "2022-06-05 21-06-03", "test", 3, 1, 3, 5.5, "image_2.jpg"),
	(2, "<p>Jos&eacute; Andr&eacute;s prefers to be known as a cook rather than a chef. The Spanish-American culinary master says he likes to &ldquo;feel the heat&rdquo;&mdash;his argument, apparently, being that self-designated &ldquo;chefs&rdquo; like to keep a polite distance from the discomfort of a live kitchen. Whether that&rsquo;s true or not&mdash;and an argument can be made that contemporary celebrity chefs are in fact in some kind of competition to show how &ldquo;real&rdquo; they can &ldquo;keep it&rdquo; in the kitchen&mdash;Andr&eacute;s clearly doesn&rsquo;t exaggerate with respect to just how much into the thick of things he can and will get.</p>", "We Feed People", "2022-06-05 21-06-46", "test", 3, 0, 0, 0, "image_3.jpeg"),
	(3, "<p>Did we really need a new take of Stephen King&rsquo;s 1980 novel Firestarter? The 1984 movie starring Drew Barrymore was reasonably compelling in that way that most early King movies were, if not particularly exceptional or memorable. (Aside from the highly unfortunate &ldquo;red-face&rdquo; casting of George C. Scott as a Native American government hit man, which, yikes!) And some may remember that John Carpenter had originally been set to direct that first adaptation of King&rsquo;s story about a young girl with a penchant for psychokinetic pyrotechnics, yet was removed from the project thanks to the underperformance of The Thing. (The job eventually went to Mark L. Lester.).&nbsp; So, the good news first: You could look at Carpenter&rsquo;s inclusion in this version &mdash; he composed an original score, along with his son Cody Carpenter and Daniel Davis &mdash; as some sort of act of contrition for that earlier act of blasphemy. As for the bad news? See: the rest of the movie.</p>", "Firestarter", "2022-06-05 21-11-54", "test", 3, 0, 0, 0, "image_4.jpg"),
	(4, "<p>The film, adapted from the 2018 Sundance short by screenwriter KD D&aacute;vila and director Carey Williams with distribution by Amazon, opens in party comedy mode: best friends Kunle (Donald Elise Watkins) and Sean (RJ Cyler) determined to become the first Black students at fictional Buchanan College to complete a &ldquo;legendary tour&rdquo; of exclusive frat parties. The two are a classic yin-yang: Kunle the strait-laced and straight-A striver studying biology (the &ldquo;Barack Obama of fungus&rdquo;, Sean ribs), Sean the laid-back stoner with zero future plan but a tight party schedule.</p>", "Emergency", "2022-06-05 21-16-21", "testtwo", 4, 1, 0, 1, "image_5.jpg");

INSERT INTO comments(comment_id, comment, comment_date, username_id, article_id, parent_comment_id) VALUES 
	(1, "Nice review!", "2022-06-05 21-16-35", 4, 1, NULL),
	(2, "Thanks testtwo!", "2022-06-05 21-17-08", 3, 1, 1),
	(3, "You welcome!", "2022-06-05 21-17-34", 4, 1, 2),
	(4, "Commend has been deleted", "2022-06-05 21-17-55", 4, 1, 1);

INSERT INTO notifications(notification_id, subscriber_id, link, notification, read, date_of_notification, publisher_avatar) VALUES
	(1, 3, "./visitProfile?id=4", "testtwo just subscribed to you!", 0, "2022-06-05 21-16-40", "eevee"),
	(2, 4, "./visitArticle?id=1", "test just replied to your comment on The Bobs Burgers Movie Review", 0, "2022-06-05 21-17-08", "charmander"),
	(3, 3, "./visitArticle?id=1", "testtwo just replied to your comment on The Bobs Burger's Movie Review", 0, "2022-06-05 21-17-34", "eevee");

INSERT INTO subscribe(subscriber_id, publisher_id) VALUES
	(4, 3);

INSERT INTO user_like_record(user_id, a_id) VALUES
	(4, 1),
	(3, 4);








