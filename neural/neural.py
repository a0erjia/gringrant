import os
from transformers import AutoTokenizer
import torch
from sentence_transformers import SentenceTransformer, models
from transformers import BertTokenizerFast, BertForSequenceClassification

model_path = os.path.dirname(os.path.abspath(__file__)) + '/weights/multilabel_classification'
num_labels = 12

# Constants
PATH = os.path.dirname(os.path.abspath(__file__)) + '/weights/text_similarity/bert-sts-ru-v1.pt'
model_name = "cointegrated/rubert-tiny2"

# Model class
class BertForSTS(torch.nn.Module):
    def __init__(self):
        super(BertForSTS, self).__init__()
        self.bert = models.Transformer(model_name, max_seq_length=500)
        self.pooling_layer = models.Pooling(self.bert.get_word_embedding_dimension())
        self.sts_bert = SentenceTransformer(modules=[self.bert, self.pooling_layer])

    def forward(self, input_data):
        output = self.sts_bert(input_data)['sentence_embedding']
        return output

class SentenceSimilarity:
    def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = BertForSTS()
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)
        self.model.load_state_dict(torch.load(PATH, self.device))
        self.model.eval()

    def get_similarity_score(self, sentence_pair: list[str]) -> float:
        test_input = self.tokenizer(sentence_pair, padding='max_length', max_length=500, truncation=True, return_tensors="pt").to(self.device)
        del test_input['token_type_ids']
        output = self.model(test_input)
        sim = torch.nn.functional.cosine_similarity(output[0], output[1], dim=0).item()
        return round(sim, 2)

mapping2label = {
    'Защита прав и свобод человека и гражданина, в том числе защита прав заключенных': 0,
    'Охрана здоровья граждан, пропаганда здорового образа жизни': 1,
    'Охрана окружающей среды и защита животных': 2,
    'Поддержка молодежных проектов, реализация которых охватывает виды деятельности, предусмотренные статьей 31.1 Федерального закона от 12 января 1996 г. № 7-ФЗ «О некоммерческих организациях»': 3,
    'Поддержка проектов в области культуры и искусства': 4,
    'Поддержка проектов в области науки, образования, просвещения': 5,
    'Поддержка семьи, материнства, отцовства  и детства': 6,
    'Развитие институтов гражданского общества': 7,
    'Развитие общественной дипломатии и поддержка соотечественников': 8,
    'Сохранение исторической памяти': 9,
    'Социальное обслуживание, социальная поддержка и защита граждан': 10,
    'Укрепление межнационального и межрелигиозного согласия': 11
}

inverted_dict = {v: k for k, v in mapping2label.items()}
max_length = 500
target_names = [0, 1,  2,  3,  4,  5, 6,  7,  8,  9, 10, 11]

class MultiLabelClassification:
    def __init__(self):
        self.model = BertForSequenceClassification.from_pretrained(model_path, num_labels=num_labels)
        self.tokenizer = BertTokenizerFast.from_pretrained(model_path)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)
        self.model.eval()

    def get_class(self, text: str) -> str:
        inputs = self.tokenizer(text, padding=True, truncation=True, max_length=max_length, return_tensors="pt")
        outputs = self.model(**inputs)
        probs = outputs[0].softmax(1)
        prediction = target_names[probs.argmax()]
        return prediction

def transform_label(label: int) -> str:
    return inverted_dict[label]
