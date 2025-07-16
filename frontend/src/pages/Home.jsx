import { Card, Col, Row } from 'antd';
import { Flex, Progress } from 'antd';

const Home = () =>{
    return (
        <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
            <div style={{marginBottom : '10px'}}>
                <h1 style={{ margin: 0, padding: 0 }}>안녕하세요. BS3팀 입니다.</h1>
            </div>
            <div style={{ overflowX: 'hidden', width: '100%' }}>
            <Row gutter={[16, 16]} wrap>
                <Col xs={24} sm={12} md={8}>
                <Card title="인원 수">3</Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                <Card title="작업진행">
                    <Progress percent={30} status="active" />
                </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                <Card title="BS">
                    BS
                </Card>
                </Col>
            </Row>
            <Row gutter={16} style={{ height: '530px', marginTop : '20px' }}>
                <Col span={12} style={{ height: '100%' }}>
                <Card title="하단 카드 1" style={{ height: '100%' }}>
                    <div style={{ height: '100%', background: '#f9f9f9' }}>
                    내용
                    </div>
                </Card>
                </Col>
                <Col span={12} style={{ height: '100%' }}>
                <Card title="하단 카드 2" style={{ height: '100%' }}>
                    <div style={{ height: '100%', background: '#f9f9f9' }}>
                    내용
                    </div>
                </Card>
                </Col>
            </Row>
            </div>
        </div>
    ); 
        
}

export default Home;