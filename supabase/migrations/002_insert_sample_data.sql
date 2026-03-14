-- 插入分类数据
INSERT INTO categories (name, icon, sort_order) VALUES
('餐饮美食', 'utensils', 1),
('休闲娱乐', 'gamepad', 2),
('购物商场', 'shopping-bag', 3),
('美容美发', 'scissors', 4),
('健身运动', 'dumbbell', 5),
('酒店住宿', 'hotel', 6),
('汽车服务', 'car', 7),
('教育培训', 'graduation-cap', 8),
('医疗服务', 'heart', 9),
('生活服务', 'wrench', 10);

-- 插入示例商家数据
INSERT INTO businesses (name, category_id, description, address, phone, opening_hours, latitude, longitude, rating, review_count) VALUES
('川味轩川菜馆', (SELECT id FROM categories WHERE name = '餐饮美食'), '正宗川菜，麻辣鲜香，环境优雅，服务周到', '北京市朝阳区三里屯路12号', '010-12345678', '10:00-22:00', 39.9388, 116.4474, 4.5, 128),
('星巴克咖啡', (SELECT id FROM categories WHERE name = '餐饮美食'), '全球知名咖啡连锁品牌，提供优质咖啡和舒适环境', '北京市海淀区中关村大街1号', '010-87654321', '07:00-23:00', 39.9833, 116.3161, 4.3, 256),
('万达影城', (SELECT id FROM categories WHERE name = '休闲娱乐'), '现代化电影院，IMAX巨幕，杜比全景声，观影体验极佳', '北京市朝阳区建国路93号', '010-55556666', '09:00-24:00', 39.9087, 116.4594, 4.6, 342),
('优衣库', (SELECT id FROM categories WHERE name = '购物商场'), '日本快时尚品牌，简约设计，优质面料，性价比高', '北京市西城区西单北大街120号', '010-99998888', '10:00-22:00', 39.9042, 116.3667, 4.2, 189),
('TONI&GUY美发', (SELECT id FROM categories WHERE name = '美容美发'), '国际知名美发品牌，专业造型师，时尚潮流发型设计', '北京市东城区王府井大街255号', '010-77778888', '09:00-21:00', 39.9097, 116.4134, 4.7, 95),
('威尔士健身', (SELECT id FROM categories WHERE name = '健身运动'), '高端健身连锁，专业器械，私人教练，团课丰富', '北京市朝阳区大望路SOHO现代城', '010-66667777', '06:00-23:00', 39.9105, 116.4755, 4.4, 167),
('如家酒店', (SELECT id FROM categories WHERE name = '酒店住宿'), '经济型连锁酒店，干净舒适，性价比高，服务贴心', '北京市海淀区学院路35号', '010-88889999', '24小时营业', 39.9842, 116.3306, 4.1, 223),
('米其林轮胎', (SELECT id FROM categories WHERE name = '汽车服务'), '专业轮胎服务，四轮定位，汽车保养，技术专业', '北京市丰台区南四环西路188号', '010-33334444', '08:00-18:00', 39.8584, 116.2865, 4.5, 78),
('新东方教育', (SELECT id FROM categories WHERE name = '教育培训'), '知名教育培训机构，语言培训，留学咨询，师资雄厚', '北京市海淀区海淀中街6号', '010-22223333', '08:00-21:00', 39.9833, 116.3161, 4.3, 134),
('协和医院', (SELECT id FROM categories WHERE name = '医疗服务'), '三甲综合性医院，医疗水平高，专家众多，设备先进', '北京市东城区东单北大街53号', '010-11112222', '24小时急诊', 39.9097, 116.4134, 4.8, 445);

-- 插入示例用户评价数据
INSERT INTO reviews (user_id, business_id, rating, content) VALUES
((SELECT id FROM users WHERE email = 'test@example.com'), (SELECT id FROM businesses WHERE name = '川味轩川菜馆'), 5, '味道非常正宗，麻辣鲜香，服务也很好，推荐！'),
((SELECT id FROM users WHERE email = 'test@example.com'), (SELECT id FROM businesses WHERE name = '星巴克咖啡'), 4, '环境不错，咖啡香醇，就是价格稍微有点贵。'),
((SELECT id FROM users WHERE email = 'test@example.com'), (SELECT id FROM businesses WHERE name = '万达影城'), 5, 'IMAX效果震撼，音响效果很棒，观影体验非常好。');