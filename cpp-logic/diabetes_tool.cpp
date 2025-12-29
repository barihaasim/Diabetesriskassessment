/* Path: diabetes-project/cpp-logic/diabetes_tool.cpp */
#include <iostream>
#include <map>
#include <string>
#include <fstream>
#include <iomanip>

using namespace std;

class AnswerNode {
private:
    int questionId;
    int selectedOption;
    AnswerNode* next;

public:
    AnswerNode(int q, int o) {
        questionId = q;
        selectedOption = o;
        next = nullptr;
    }

    int getQuestionId() const { return questionId; }
    int getSelectedOption() const { return selectedOption; }
    AnswerNode* getNext() const { return next; }
    friend class AnswerList;
};

class AnswerList {
private:
    AnswerNode* head;

public:
    AnswerList() { head = nullptr; }

    void addAnswer(int q, int option) {
        AnswerNode* newNode = new AnswerNode(q, option);
        if (head == nullptr) {
            head = newNode;
            return;
        }
        AnswerNode* temp = head;
        while (temp->next != nullptr) {
            temp = temp->next;
        }
        temp->next = newNode;
    }

    void pop() {
        if (head != nullptr) {
            AnswerNode* temp = head;
            head = head->next;
            delete temp;
        }
    }

    void remove(int id) {
        if (head == nullptr) return;

        if (head->questionId == id) {
            AnswerNode* temp = head;
            head = head->next;
            delete temp;
            return;
        }

        AnswerNode* current = head;
        while (current->next != nullptr && current->next->questionId != id) {
            current = current->next;
        }

        if (current->next != nullptr) {
            AnswerNode* temp = current->next;
            current->next = temp->next;
            delete temp;
        }
    }

    void insert(int q, int option, int position) {
        if (position < 0) return;
        AnswerNode* newNode = new AnswerNode(q, option);

        if (position == 0) {
            newNode->next = head;
            head = newNode;
            return;
        }

        AnswerNode* temp = head;
        for (int i = 0; i < position - 1 && temp != nullptr; i++) {
            temp = temp->next;
        }

        if (temp != nullptr) {
            newNode->next = temp->next;
            temp->next = newNode;
        } else {
            delete newNode;
        }
    }

    AnswerNode* getHead() { return head; }
};


class QuestionNode {
private:
    int questionId;
    string questionText;
    QuestionNode* next;

public:
    QuestionNode(int id, string text) {
        questionId = id;
        questionText = text;
        next = nullptr;
    }

    int getQuestionId() const { return questionId; }
    string getQuestionText() const { return questionText; }
    QuestionNode* getNext() const { return next; }
    friend class QuestionList;
};

class QuestionList {
private:
    QuestionNode* head;

public:
    QuestionList() { head = nullptr; }

    void addQuestion(int id, string text) {
        QuestionNode* node = new QuestionNode(id, text);
        if (head == nullptr) {
            head = node;
        }
        else {
            QuestionNode* temp = head;
            while (temp->next != nullptr) {
                temp = temp->next;
            }
            temp->next = node;
        }
    }

    void pop() {
        if (head != nullptr) {
            QuestionNode* temp = head;
            head = head->next;
            delete temp;
        }
    }

    void remove(int id) {
        if (head == nullptr) return;

        if (head->questionId == id) {
            QuestionNode* temp = head;
            head = head->next;
            delete temp;
            return;
        }

        QuestionNode* current = head;
        while (current->next != nullptr && current->next->questionId != id) {
            current = current->next;
        }

        if (current->next != nullptr) {
            QuestionNode* temp = current->next;
            current->next = temp->next;
            delete temp;
        }
    }

    void insert(int id, string text, int position) {
        if (position < 0) return;
        QuestionNode* node = new QuestionNode(id, text);

        if (position == 0) {
            node->next = head;
            head = node;
            return;
        }

        QuestionNode* temp = head;
        for (int i = 0; i < position - 1 && temp != nullptr; i++) {
            temp = temp->next;
        }

        if (temp != nullptr) {
            node->next = temp->next;
            temp->next = node;
        } else {
            delete node;
        }
    }

    QuestionNode* getHead() { return head; }
};


class RiskNode {
private:
    int points;
    int questionId;
    RiskNode* next;

public:
    RiskNode(int p, int id) {
        points = p;
        questionId = id;
        next = nullptr;
    }

    int getPoints() const { return points; }
    int getQuestionId() const { return questionId; }
    RiskNode* getNext() const { return next; }
    friend class RiskQueue;
};

class RiskQueue {
private:
    RiskNode* head;

public:
    RiskQueue() { head = nullptr; }

    bool empty() { return head == nullptr; }

    
    void push(pair<int, int> val) {
        int points = val.first;
        int id = val.second;
        RiskNode* newNode = new RiskNode(points, id);

        if (head == nullptr || head->points < points) {
            newNode->next = head;
            head = newNode;
        } else {
            RiskNode* current = head;
            while (current->next != nullptr && current->next->points >= points) {
                current = current->next;
            }
            newNode->next = current->next;
            current->next = newNode;
        }
    }

    pair<int, int> top() {
        if (head != nullptr) {
            return make_pair(head->points, head->questionId);
        }
        return make_pair(0, 0); 
    }

    void pop() {
        if (head != nullptr) {
            RiskNode* temp = head;
            head = head->next;
            delete temp;
        }
    }
};


class DiabetesAssessment {
private:
    QuestionList questions;
    AnswerList answers;
    map<int, map<int, int>> scoring;
    RiskQueue riskQueue;
    int totalScore;
    double bmi;
    double height;
    double weight;
    string riskLevel;
    double averageScore;
    int totalUsers;

public:
    DiabetesAssessment() {
        totalScore = 0;
        bmi = 0.0;
        height = 0.0;
        weight = 0.0;
        averageScore = 0.0;
        totalUsers = 0;
        setupQuestions();
        setupScoring();
    }

    void setupQuestions() {
        questions.addQuestion(1, "What is your age group? (1:<30 2:30-45 3:45-60 4:60+)");
        questions.addQuestion(2, "What is your gender? (1:Male 2:Female)");
        questions.addQuestion(3, "Family history of diabetes? (1:Yes 2:No)");
        questions.addQuestion(4, "High blood pressure? (1:Yes 2:No)");
        questions.addQuestion(5, "Physically active? (1:Yes 2:No)");
        questions.addQuestion(6, "Blurry vision? (1:Yes 2:No)");
        questions.addQuestion(7, "Numbness in hands or feet? (1:Yes 2:No)");
        questions.addQuestion(8, "HbA1c level? (1:High 2:Medium 3:Normal)");
        questions.addQuestion(9, "Fasting glucose level? (1:High 2:Medium 3:Normal)");
        questions.addQuestion(10, "Excessive thirst or urination? (1:Yes 2:No)");
    }

    void setupScoring() {
        scoring = {
            {1, {{1,0},{2,1},{3,2},{4,3}}},
            {2, {{1,2},{2,0}}},
            {3, {{1,3},{2,0}}},
            {4, {{1,2},{2,0}}},
            {5, {{1,0},{2,2}}},
            {6, {{1,2},{2,0}}},
            {7, {{1,2},{2,0}}},
            {8, {{1,3},{2,2},{3,1}}},
            {9, {{1,3},{2,2},{3,1}}},
            {10, {{1,2},{2,0}}}
        };
    }

    
    void setBMI(double h, double w) {
        height = h;
        weight = w;
        if (height > 0 && weight > 0) {
            double heightInMeters = height / 100.0;
            bmi = weight / (heightInMeters * heightInMeters);
            
            
            if (bmi >= 30) {
                totalScore += 5;  
            } else if (bmi >= 25) {
                totalScore += 2;  
            }
        }
    }

    double getBMI() const { return bmi; }

    void submitAnswer(int questionId, int option) {
        answers.addAnswer(questionId, option);
    }

    QuestionNode* getQuestions() { return questions.getHead(); }

    void evaluate() {
        AnswerNode* temp = answers.getHead();
        while (temp != nullptr) {
            int qId = temp->getQuestionId();
            int opt = temp->getSelectedOption();
            int points = scoring[qId][opt];
            totalScore += points;

            if (points > 0) {
                riskQueue.push(make_pair(points, qId));
            }
            temp = temp->getNext();
        }
    }

    void loadAndUpdateStats() {
        int sumOfScores = 0;
        totalUsers = 0;
        
        ifstream statsIn("stats.txt");
        if (statsIn.is_open()) {
            statsIn >> totalUsers >> sumOfScores;
            statsIn.close();
        }
        
        totalUsers++;
        sumOfScores += totalScore;
        
        averageScore = (totalUsers > 0) ? (double)sumOfScores / totalUsers : 0;
        
        ofstream statsOut("stats.txt");
        if (statsOut.is_open()) {
            statsOut << totalUsers << " " << sumOfScores;
            statsOut.close();
        }
    }



    void showResult() {
        cout << "\n===== DIABETES RISK ASSESSMENT =====\n";
        cout << "Total Risk Score: " << totalScore << "\n";
        
        if (bmi > 0) {
            cout << "BMI: " << fixed << setprecision(1) << bmi;
            if (bmi < 18.5) cout << " (Underweight)";
            else if (bmi < 25) cout << " (Normal)";
            else if (bmi < 30) cout << " (Overweight, +2 points)";
            else cout << " (Obese, +5 points)";
            cout << "\n";
        }
        
        cout << "\nTop Risk Factors:\n";
        for (int i = 0; i < 3 && !riskQueue.empty(); i++) {
            pair<int, int> top = riskQueue.top();
            riskQueue.pop();
            cout << "Question " << top.second << " (Points: " << top.first << ")\n";
        }

        cout << "\nFinal Assessment:\n";
        
        if (totalScore >= 22) {
            riskLevel = "CRITICAL";
            cout << "CRITICAL Risk: Urgent medical attention required.\n";
            cout << "\nRECOMMENDATIONS:\n";
            cout << "- Schedule an appointment with an endocrinologist within 24-48 hours\n";
            cout << "- Get comprehensive blood work including HbA1c, fasting glucose, and lipid panel\n";
            cout << "- Monitor blood glucose levels 4-6 times daily\n";
            cout << "- Begin medication review with your healthcare provider\n";
            cout << "- Consider continuous glucose monitoring (CGM) device\n";
            cout << "- Reduce carbohydrate intake immediately to under 130g per day\n";
            cout << "- Avoid all sugary beverages and processed foods\n";
        }
        else if (totalScore >= 18) {
            riskLevel = "HIGH";
            cout << "HIGH Risk: Medical consultation strongly advised.\n";
            cout << "\nRECOMMENDATIONS:\n";
            cout << "- Consult your primary care physician within 1-2 weeks\n";
            cout << "- Get a fasting blood glucose test and HbA1c test\n";
            cout << "- Monitor blood glucose 2-3 times daily for 2 weeks\n";
            cout << "- Reduce refined sugar intake to under 25g per day\n";
            cout << "- Start a low glycemic index (GI) diet plan\n";
            cout << "- Exercise for 30 minutes daily (walking, swimming, or cycling)\n";
            cout << "- Aim for 7-8 hours of quality sleep each night\n";
        }
        else if (totalScore >= 14) {
            riskLevel = "ELEVATED";
            cout << "ELEVATED Risk: Preventive action recommended.\n";
            cout << "\nRECOMMENDATIONS:\n";
            cout << "- Schedule a check-up with your doctor within the month\n";
            cout << "- Request fasting glucose and HbA1c screening\n";
            cout << "- Reduce processed food and added sugar consumption\n";
            cout << "- Increase fiber intake to 25-30g per day\n";
            cout << "- Exercise at least 150 minutes per week (moderate intensity)\n";
            cout << "- Maintain a healthy weight (target BMI 18.5-24.9)\n";
            cout << "- Stay hydrated with 8-10 glasses of water daily\n";
        }
        else if (totalScore >= 10) {
            riskLevel = "MODERATE";
            cout << "MODERATE Risk: Lifestyle modifications suggested.\n";
            cout << "\nRECOMMENDATIONS:\n";
            cout << "- Annual health screening including blood glucose check\n";
            cout << "- Follow a balanced Mediterranean-style diet\n";
            cout << "- Include 30 minutes of physical activity most days\n";
            cout << "- Limit processed carbohydrates and choose whole grains\n";
            cout << "- Monitor your weight and waist circumference monthly\n";
            cout << "- Manage stress through meditation or relaxation techniques\n";
        }
        else if (totalScore >= 5) {
            riskLevel = "LOW";
            cout << "LOW Risk: Continue healthy habits with awareness.\n";
            cout << "\nRECOMMENDATIONS:\n";
            cout << "- Maintain regular annual health check-ups\n";
            cout << "- Continue a balanced diet rich in vegetables and lean proteins\n";
            cout << "- Stay physically active with regular exercise\n";
            cout << "- Monitor family health history and stay informed\n";
            cout << "- Limit alcohol consumption and avoid smoking\n";
        }
        else {
            riskLevel = "MINIMAL";
            cout << "MINIMAL Risk: Excellent health indicators.\n";
            cout << "\nRECOMMENDATIONS:\n";
            cout << "- Continue your current healthy lifestyle\n";
            cout << "- Maintain regular annual check-ups\n";
            cout << "- Stay physically active and eat a balanced diet\n";
            cout << "- Continue monitoring your health as you age\n";
        }

        loadAndUpdateStats();
        cout << "\n===== STATISTICAL COMPARISON =====\n";
        cout << "Average Score: " << fixed << setprecision(1) << averageScore << "\n";
        cout << "Total Assessments: " << totalUsers << "\n";
        
        
    }
};

int main() {
    DiabetesAssessment assessment;
    
    double height, weight;
    cin >> height >> weight;
    assessment.setBMI(height, weight);
    
    QuestionNode* current = assessment.getQuestions();
    int option;

    while (current != nullptr) {
        cout << "\nQ" << current->getQuestionId() << ": " << current->getQuestionText() << endl;
        cout << "Enter option: ";
        if (!(cin >> option)) break;

        if (option < 1 || option > 4) {
            cout << "Invalid option. Please enter a valid choice.\n";
            continue;
        }

        assessment.submitAnswer(current->getQuestionId(), option);
        current = current->getNext();
    }

    assessment.evaluate();
    assessment.showResult();

    return 0;
}